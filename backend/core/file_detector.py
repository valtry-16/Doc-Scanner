import os
import mimetypes
from typing import Optional


def detect_file_type(file_path: str) -> Optional[str]:
    """
    Detect file type from file path
    
    Args:
        file_path: Path to file
        
    Returns:
        File type category (image, pdf, document) or None
    """
    mime_type, _ = mimetypes.guess_type(file_path)
    
    if mime_type:
        if mime_type.startswith('image/'):
            return 'image'
        elif mime_type == 'application/pdf':
            return 'pdf'
        elif mime_type in [
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/html'
        ]:
            return 'document'
    
    # Fallback to extension-based detection
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext in ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']:
        return 'image'
    elif ext == '.pdf':
        return 'pdf'
    elif ext in ['.docx', '.txt', '.html', '.htm']:
        return 'document'
    
    return None


def get_file_extension(file_path: str) -> str:
    """
    Get file extension without dot
    
    Args:
        file_path: Path to file
        
    Returns:
        File extension
    """
    return os.path.splitext(file_path)[1].lower().lstrip('.')


def is_image_file(file_path: str) -> bool:
    """Check if file is an image"""
    return detect_file_type(file_path) == 'image'


def is_pdf_file(file_path: str) -> bool:
    """Check if file is a PDF"""
    return detect_file_type(file_path) == 'pdf'


def is_document_file(file_path: str) -> bool:
    """Check if file is a document"""
    return detect_file_type(file_path) == 'document'
