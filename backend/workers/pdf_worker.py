import os
from utils.pdf_utils import compress_pdf, merge_pdfs
from utils.logger import log_job
from core.job_manager import set_job_status, set_job_result, set_job_error, JobStatus
from core.temp_storage import get_output_path


def compress_pdfs_task(job_id: str, file_paths: list):
    """
    Compress PDF files
    
    Args:
        job_id: Job ID
        file_paths: List of PDF file paths to compress
    """
    try:
        log_job(job_id, f"Starting compression of {len(file_paths)} PDFs")
        set_job_status(job_id, JobStatus.PROCESSING, 0)
        
        output_files = []
        total_files = len(file_paths)
        
        for idx, file_path in enumerate(file_paths):
            filename = os.path.basename(file_path)
            output_filename = f"compressed_{filename}"
            output_path = get_output_path(job_id, output_filename)
            
            success, message = compress_pdf(file_path, output_path)
            
            if success:
                output_files.append(output_filename)
                progress = int(((idx + 1) / total_files) * 100)
                set_job_status(job_id, JobStatus.PROCESSING, progress)
            else:
                log_job(job_id, f"Failed to compress {filename}: {message}", "error")
        
        if not output_files:
            raise Exception("No PDFs were successfully compressed")
        
        result_filename = output_files[0] if len(output_files) == 1 else output_files[0]
        
        result = {
            "download_url": f"/downloads/{job_id}/{result_filename}",
            "filename": result_filename,
            "file_size": os.path.getsize(get_output_path(job_id, result_filename))
        }
        
        set_job_result(job_id, result)
        log_job(job_id, "PDF compression completed successfully")
        
    except Exception as e:
        log_job(job_id, f"PDF compression failed: {str(e)}", "error")
        set_job_error(job_id, str(e))


def merge_pdfs_task(job_id: str, file_paths: list):
    """
    Merge multiple PDF files
    
    Args:
        job_id: Job ID
        file_paths: List of PDF file paths to merge
    """
    try:
        log_job(job_id, f"Starting merge of {len(file_paths)} PDFs")
        set_job_status(job_id, JobStatus.PROCESSING, 50)
        
        output_filename = "merged.pdf"
        output_path = get_output_path(job_id, output_filename)
        
        success, message = merge_pdfs(file_paths, output_path)
        
        if not success:
            raise Exception(message)
        
        result = {
            "download_url": f"/downloads/{job_id}/{output_filename}",
            "filename": output_filename,
            "file_size": os.path.getsize(output_path)
        }
        
        set_job_result(job_id, result)
        log_job(job_id, "PDF merge completed successfully")
        
    except Exception as e:
        log_job(job_id, f"PDF merge failed: {str(e)}", "error")
        set_job_error(job_id, str(e))
