from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import uuid
from core.validators import validate_upload_file
from core.temp_storage import save_upload_files, create_job_directory
from core.job_manager import create_job
from core.file_detector import is_image_file, is_pdf_file
from core.task_processor import submit_task
from workers.ocr_worker import perform_ocr_task

router = APIRouter()


@router.post("/ocr")
async def perform_ocr(files: List[UploadFile] = File(...)):
    """
    Perform OCR on uploaded images or PDFs
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
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
    
    # Filter files suitable for OCR
    ocr_paths = [p for p in file_paths if is_image_file(p) or is_pdf_file(p)]
    
    if not ocr_paths:
        raise HTTPException(
            status_code=400,
            detail="No supported files for OCR (images or PDFs only)"
        )
    
    # Create job
    create_job(job_id, "ocr")
    
    # Dispatch to worker using thread pool
    submit_task(perform_ocr_task, job_id, ocr_paths)
    
    return {
        "job_id": job_id,
        "message": f"OCR job started for {len(ocr_paths)} file(s)"
    }
