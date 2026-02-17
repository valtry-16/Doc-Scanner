from fastapi import APIRouter, HTTPException
from core.job_manager import get_job

router = APIRouter()


@router.get("/status/{job_id}")
async def get_job_status(job_id: str):
    """
    Get status of a job by ID
    """
    job_data = get_job(job_id)
    
    if not job_data:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job_data
