from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import List, Optional
import uuid
from core.validators import validate_upload_file
from core.temp_storage import save_upload_files, create_job_directory
from core.job_manager import create_job
from core.file_detector import is_image_file
from core.task_processor import submit_task
from workers.image_worker import convert_images_task
from utils.logger import logger

router = APIRouter()


@router.post("/convert")
async def convert_files(
    files: List[UploadFile] = File(...),
    target_format: str = Form(...),
    resize_width: Optional[int] = Form(None),
    resize_height: Optional[int] = Form(None),
    keep_aspect: Optional[bool] = Form(True)
):
    """
    Convert uploaded images/PDFs to target format
    - Image to Image: JPG, PNG, WebP
    - Image to PDF: Multiple images → Single PDF
    - PDF to Image: Each page → Separate image (JPG, PNG, WebP)
    """
    logger.info(f"Convert endpoint called with {len(files)} files, target format: {target_format}")
    
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    # Validate target format
    supported_formats = ['jpg', 'jpeg', 'png', 'webp', 'pdf']
    if target_format.lower() not in supported_formats:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported target format. Supported: {', '.join(supported_formats)}"
        )
    
    # Validate resize options
    if resize_width is not None and resize_width <= 0:
        raise HTTPException(status_code=400, detail="Resize width must be greater than 0")
    if resize_height is not None and resize_height <= 0:
        raise HTTPException(status_code=400, detail="Resize height must be greater than 0")
    if keep_aspect is False and (resize_width is None or resize_height is None):
        raise HTTPException(status_code=400, detail="Provide both width and height when aspect ratio is unlocked")

    # Validate file types - both images and PDFs are allowed
    for file in files:
        logger.info(f"Validating file: {file.filename}, content_type: {file.content_type}")
        
        ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
        is_image = (
            file.content_type and file.content_type.startswith('image/') or
            ext in ['jpg', 'jpeg', 'png', 'webp']
        )
        is_pdf = (
            file.content_type == 'application/pdf' or ext == 'pdf'
        )
        
        if not (is_image or is_pdf):
            raise HTTPException(
                status_code=400, 
                detail=f"File '{file.filename}' is not supported. Only images (JPG, PNG, WebP) and PDFs are supported."
            )
        
        # Now do general validation
        valid, error = validate_upload_file(file)
        if not valid:
            logger.error(f"File validation failed: {error}")
            raise HTTPException(status_code=400, detail=error)
    
    # Generate job ID
    job_id = str(uuid.uuid4())
    
    # Create job directory and save files
    job_dir = create_job_directory(job_id)
    file_paths = await save_upload_files(files, job_dir)
    
    if not file_paths:
        raise HTTPException(status_code=400, detail="No valid files found after upload.")
    
    # Create job
    create_job(job_id, "convert")
    
    # Dispatch to worker using thread pool
    submit_task(
        convert_images_task,
        job_id,
        file_paths,
        target_format.lower(),
        resize_width,
        resize_height,
        keep_aspect
    )
    
    return {
        "job_id": job_id,
        "message": f"Conversion job started for {len(files)} file(s)"
    }
