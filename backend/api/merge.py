from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import uuid
from core.validators import validate_upload_file
from core.temp_storage import save_upload_files, create_job_directory
from core.job_manager import create_job
from core.file_detector import is_pdf_file
from core.task_processor import submit_task
from workers.pdf_worker import merge_pdfs_task

router = APIRouter()


@router.post("/merge")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    """
    Merge multiple PDF files into one
    """
    if not files or len(files) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 PDF files are required for merging"
        )
    
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
    
    # Filter only PDF files
    pdf_paths = [p for p in file_paths if is_pdf_file(p)]
    
    if len(pdf_paths) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 PDF files are required"
        )
    
    # Create job
    create_job(job_id, "merge")
    
    # Dispatch to worker using thread pool
    submit_task(merge_pdfs_task, job_id, pdf_paths)
    
    return {
        "job_id": job_id,
        "message": f"Merge job started for {len(pdf_paths)} PDF file(s)"
    }
