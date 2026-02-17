from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import List, Optional
from io import BytesIO
from PIL import Image
import uuid
from core.validators import validate_upload_file
from core.temp_storage import save_upload_files, create_job_directory
from core.job_manager import create_job
from core.file_detector import is_image_file, is_pdf_file
from core.task_processor import submit_task
from workers.image_worker import compress_images_task
from workers.pdf_worker import compress_pdfs_task

router = APIRouter()


@router.post("/compress/estimate")
async def estimate_compression(
    file: UploadFile = File(...),
    quality: Optional[int] = Form(85)
):
    """
    Estimate compressed size for an image without storing output.
    """
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    if quality < 50 or quality > 100:
        raise HTTPException(status_code=400, detail="Quality must be between 50 and 100")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    content_type = file.content_type or ''
    filename = file.filename or ''
    ext = filename.split('.')[-1].lower() if '.' in filename else ''

    is_image = content_type.startswith('image/') or ext in ['jpg', 'jpeg', 'png', 'webp']
    if not is_image:
        raise HTTPException(status_code=400, detail="Only image files are supported for estimation")

    try:
        with Image.open(BytesIO(data)) as img:
            if img.mode == 'RGBA':
                img = img.convert('RGB')

            output = BytesIO()
            fmt = (img.format or '').upper()

            if ext in ['jpg', 'jpeg'] or fmt == 'JPEG':
                img.save(output, format='JPEG', quality=quality, optimize=True)
            elif ext == 'png' or fmt == 'PNG':
                img.save(output, format='PNG', optimize=True, compress_level=9)
            elif ext == 'webp' or fmt == 'WEBP':
                img.save(output, format='WEBP', quality=quality)
            else:
                img.save(output, format='JPEG', quality=quality, optimize=True)

            estimated_size = output.tell()

        original_size = len(data)
        savings = max(0, original_size - estimated_size)
        savings_percent = (savings / original_size * 100) if original_size > 0 else 0

        return {
            "original_size": original_size,
            "estimated_size": estimated_size,
            "estimated_savings": savings,
            "estimated_savings_percent": round(savings_percent, 1)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Estimate failed: {str(e)}")


@router.post("/compress")
async def compress_files(
    files: List[UploadFile] = File(...),
    quality: Optional[int] = Form(85)
):
    """
    Compress uploaded files (images or PDFs)
    
    Args:
        files: Files to compress
        quality: Compression quality (50-100, default 85)
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    # Validate quality
    if quality < 50 or quality > 100:
        raise HTTPException(status_code=400, detail="Quality must be between 50 and 100")
    
    # Validate files
    for file in files:
        valid, error = validate_upload_file(file)
        if not valid:
            raise HTTPException(status_code=400, detail=error)
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Create job directory and save files
    job_dir = create_job_directory(job_id)
    file_paths = await save_upload_files(files, job_dir)
    
    # Separate images and PDFs
    image_paths = [p for p in file_paths if is_image_file(p)]
    pdf_paths = [p for p in file_paths if is_pdf_file(p)]
    
    # Create job
    create_job(job_id, "compress")
    
    # Dispatch to appropriate worker using thread pool
    if image_paths:
        submit_task(compress_images_task, job_id, image_paths, quality)
    elif pdf_paths:
        submit_task(compress_pdfs_task, job_id, pdf_paths)
    else:
        raise HTTPException(status_code=400, detail="No supported files found")
    
    return {
        "job_id": job_id,
        "message": f"Compression job started for {len(files)} file(s)"
    }
