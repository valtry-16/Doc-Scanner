import json
import threading
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from pathlib import Path
from config import settings

# In-memory job storage with thread-safe access
_jobs: Dict[str, Dict[str, Any]] = {}
_jobs_lock = threading.Lock()

# Persistence file
JOBS_FILE = Path(settings.UPLOAD_DIR) / "jobs.json"


class JobStatus:
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


def create_job(job_id: str, job_type: str) -> Dict[str, Any]:
    """
    Create a new job
    
    Args:
        job_id: Unique job ID
        job_type: Type of job (compress, convert, merge, ocr)
        
    Returns:
        Job data dictionary
    """
    job_data = {
        "job_id": job_id,
        "job_type": job_type,
        "status": JobStatus.PENDING,
        "progress": 0,
        "result": None,
        "error": None,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    
    # Store in memory
    with _jobs_lock:
        _jobs[job_id] = job_data
        _save_jobs()
    
    return job_data


def get_job(job_id: str) -> Optional[Dict[str, Any]]:
    """
    Get job by ID
    
    Args:
        job_id: Job ID
        
    Returns:
        Job data dictionary or None
    """
    with _jobs_lock:
        return _jobs.get(job_id)


def update_job(job_id: str, update_data: Dict[str, Any]) -> bool:
    """
    Update job data
    
    Args:
        job_id: Job ID
        update_data: Data to update
        
    Returns:
        Success boolean
    """
    with _jobs_lock:
        if job_id not in _jobs:
            return False
        
        _jobs[job_id].update(update_data)
        _jobs[job_id]["updated_at"] = datetime.utcnow().isoformat()
        _save_jobs()
    
    return True


def set_job_status(job_id: str, status: str, progress: int = None):
    """
    Update job status
    
    Args:
        job_id: Job ID
        status: New status
        progress: Progress percentage (optional)
    """
    update_data = {"status": status}
    if progress is not None:
        update_data["progress"] = progress
    
    update_job(job_id, update_data)


def set_job_result(job_id: str, result: Dict[str, Any]):
    """
    Set job result
    
    Args:
        job_id: Job ID
        result: Result data
    """
    update_job(job_id, {
        "status": JobStatus.COMPLETED,
        "progress": 100,
        "result": result
    })


def set_job_error(job_id: str, error: str):
    """
    Set job error
    
    Args:
        job_id: Job ID
        error: Error message
    """
    update_job(job_id, {
        "status": JobStatus.FAILED,
        "error": error
    })


def _save_jobs():
    """Save jobs to disk (called within lock)"""
    try:
        JOBS_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(JOBS_FILE, 'w') as f:
            json.dump(_jobs, f, indent=2)
    except Exception as e:
        print(f"Error saving jobs: {e}")


def _load_jobs():
    """Load jobs from disk"""
    global _jobs
    try:
        if JOBS_FILE.exists():
            with open(JOBS_FILE, 'r') as f:
                _jobs = json.load(f)
            print(f"Loaded {len(_jobs)} jobs from disk")
    except Exception as e:
        print(f"Error loading jobs: {e}")
        _jobs = {}


def get_all_jobs() -> Dict[str, Dict[str, Any]]:
    """Get all jobs (for debugging)"""
    with _jobs_lock:
        return dict(_jobs)


def delete_job(job_id: str) -> bool:
    """Delete a job"""
    with _jobs_lock:
        if job_id in _jobs:
            del _jobs[job_id]
            _save_jobs()
            return True
    return False


def cleanup_old_jobs():
    """Remove jobs older than retention period"""
    cutoff = datetime.utcnow() - timedelta(minutes=settings.FILE_RETENTION_MINUTES)
    
    with _jobs_lock:
        jobs_to_delete = []
        for job_id, job_data in _jobs.items():
            created_at = datetime.fromisoformat(job_data["created_at"])
            if created_at < cutoff:
                jobs_to_delete.append(job_id)
        
        for job_id in jobs_to_delete:
            del _jobs[job_id]
        
        if jobs_to_delete:
            _save_jobs()
            print(f"Cleaned up {len(jobs_to_delete)} old jobs")


# Load existing jobs on module import
_load_jobs()
