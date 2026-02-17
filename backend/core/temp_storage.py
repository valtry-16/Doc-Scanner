import os
import shutil
import aiofiles
from fastapi import UploadFile
from typing import List
import uuid
from datetime import datetime, timedelta
from config import settings


def generate_unique_filename(original_filename: str) -> str:
    """
    Generate a unique filename
    
    Args:
        original_filename: Original filename
        
    Returns:
        Unique filename
    """
    ext = os.path.splitext(original_filename)[1]
    unique_id = uuid.uuid4().hex
    return f"{unique_id}{ext}"


async def save_upload_file(file: UploadFile, destination: str) -> str:
    """
    Save uploaded file to destination
    
    Args:
        file: Uploaded file
        destination: Destination directory
        
    Returns:
        Path to saved file
    """
    os.makedirs(destination, exist_ok=True)
    
    filename = generate_unique_filename(file.filename)
    file_path = os.path.join(destination, filename)
    
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    return file_path


async def save_upload_files(files: List[UploadFile], destination: str) -> List[str]:
    """
    Save multiple uploaded files
    
    Args:
        files: List of uploaded files
        destination: Destination directory
        
    Returns:
        List of paths to saved files
    """
    file_paths = []
    for file in files:
        path = await save_upload_file(file, destination)
        file_paths.append(path)
    
    return file_paths


def get_file_age_minutes(file_path: str) -> float:
    """
    Get age of file in minutes
    
    Args:
        file_path: Path to file
        
    Returns:
        Age in minutes
    """
    if not os.path.exists(file_path):
        return 0
    
    created_time = os.path.getctime(file_path)
    current_time = datetime.now().timestamp()
    age_seconds = current_time - created_time
    
    return age_seconds / 60


def cleanup_old_files(directory: str, max_age_minutes: int = None):
    """
    Remove old files from directory
    
    Args:
        directory: Directory to clean
        max_age_minutes: Maximum age in minutes (default from settings)
    """
    if max_age_minutes is None:
        max_age_minutes = settings.FILE_RETENTION_MINUTES
    
    if not os.path.exists(directory):
        return
    
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        
        if os.path.isfile(file_path):
            age = get_file_age_minutes(file_path)
            if age > max_age_minutes:
                try:
                    os.remove(file_path)
                except Exception:
                    pass
        elif os.path.isdir(file_path):
            # Recursively clean subdirectories
            cleanup_old_files(file_path, max_age_minutes)
            # Remove empty directories
            try:
                os.rmdir(file_path)
            except Exception:
                pass


def create_job_directory(job_id: str) -> str:
    """
    Create a directory for a job
    
    Args:
        job_id: Job ID
        
    Returns:
        Path to job directory
    """
    job_dir = os.path.join(settings.UPLOAD_DIR, job_id)
    os.makedirs(job_dir, exist_ok=True)
    return job_dir


def get_output_path(job_id: str, filename: str) -> str:
    """
    Get output file path for a job
    
    Args:
        job_id: Job ID
        filename: Output filename
        
    Returns:
        Path to output file
    """
    output_path = os.path.join(settings.OUTPUT_DIR, job_id, filename)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    return output_path
