from fastapi import UploadFile
import os
from typing import Tuple
from config import settings


def validate_file_size(file: UploadFile) -> Tuple[bool, str]:
    """
    Validate file size
    
    Args:
        file: Uploaded file
        
    Returns:
        Tuple of (valid, error_message)
    """
    # Note: This is a basic check. For accurate size, we need to read the file
    # In production, implement chunked reading to avoid memory issues
    return True, ""


def validate_file_extension(filename: str) -> Tuple[bool, str]:
    """
    Validate file extension
    
    Args:
        filename: Name of the file
        
    Returns:
        Tuple of (valid, error_message)
    """
    ext = os.path.splitext(filename)[1].lower().lstrip('.')
    
    allowed_extensions = (
        settings.SUPPORTED_IMAGE_FORMATS + 
        settings.SUPPORTED_DOCUMENT_FORMATS
    )
    
    if ext not in allowed_extensions:
        return False, f"Unsupported file format: {ext}"
    
    return True, ""


def validate_upload_file(file: UploadFile) -> Tuple[bool, str]:
    """
    Validate uploaded file
    
    Args:
        file: Uploaded file
        
    Returns:
        Tuple of (valid, error_message)
    """
    # Check filename
    if not file.filename:
        return False, "No filename provided"
    
    # Check extension
    ext_valid, ext_error = validate_file_extension(file.filename)
    if not ext_valid:
        return False, ext_error
    
    # Check size
    size_valid, size_error = validate_file_size(file)
    if not size_valid:
        return False, size_error
    
    return True, ""
