from PIL import Image
import os
from typing import Tuple
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader


def compress_image(input_path: str, output_path: str, quality: int = 85) -> Tuple[bool, str]:
    """
    Compress an image file
    
    Args:
        input_path: Path to input image
        output_path: Path to save compressed image
        quality: Compression quality (1-100)
        
    Returns:
        Tuple of (success, message)
    """
    try:
        with Image.open(input_path) as img:
            # Convert RGBA to RGB if necessary
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            
            # Determine format from extension
            ext = os.path.splitext(output_path)[1].lower()
            
            if ext in ['.jpg', '.jpeg']:
                img.save(output_path, 'JPEG', quality=quality, optimize=True)
            elif ext == '.png':
                img.save(output_path, 'PNG', optimize=True)
            elif ext == '.webp':
                img.save(output_path, 'WEBP', quality=quality)
            else:
                img.save(output_path, quality=quality, optimize=True)
        
        return True, "Image compressed successfully"
    except Exception as e:
        return False, f"Failed to compress image: {str(e)}"


def convert_image(input_path: str, output_path: str, target_format: str) -> Tuple[bool, str]:
    """
    Convert an image to a different format
    
    Args:
        input_path: Path to input image
        output_path: Path to save converted image
        target_format: Target format (jpg, png, webp, pdf)
        
    Returns:
        Tuple of (success, message)
    """
    try:
        # Handle PDF conversion separately
        if target_format.lower() == 'pdf':
            return image_to_pdf(input_path, output_path)
        
        with Image.open(input_path) as img:
            # Convert RGBA to RGB for JPEG
            if target_format.lower() in ['jpg', 'jpeg'] and img.mode == 'RGBA':
                img = img.convert('RGB')
            
            # Save in target format
            if target_format.lower() in ['jpg', 'jpeg']:
                img.save(output_path, 'JPEG', quality=95)
            elif target_format.lower() == 'png':
                img.save(output_path, 'PNG')
            elif target_format.lower() == 'webp':
                img.save(output_path, 'WEBP', quality=95)
            else:
                return False, f"Unsupported target format: {target_format}"
        
        return True, f"Image converted to {target_format.upper()}"
    except Exception as e:
        return False, f"Failed to convert image: {str(e)}"


def image_to_pdf(input_path: str, output_path: str) -> Tuple[bool, str]:
    """
    Convert an image to PDF format
    
    Args:
        input_path: Path to input image
        output_path: Path to save PDF
        
    Returns:
        Tuple of (success, message)
    """
    try:
        with Image.open(input_path) as img:
            # Convert RGBA to RGB
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            
            # Get image dimensions
            img_width, img_height = img.size
            
            # Create PDF with image dimensions (in points)
            c = canvas.Canvas(output_path, pagesize=(img_width, img_height))
            
            # Draw image on PDF
            c.drawImage(input_path, 0, 0, width=img_width, height=img_height)
            c.save()
        
        return True, "Image converted to PDF"
    except Exception as e:
        return False, f"Failed to convert image to PDF: {str(e)}"


def get_image_info(image_path: str) -> dict:
    """
    Get information about an image
    
    Args:
        image_path: Path to image file
        
    Returns:
        Dictionary with image information
    """
    try:
        with Image.open(image_path) as img:
            return {
                "format": img.format,
                "mode": img.mode,
                "size": img.size,
                "width": img.width,
                "height": img.height,
            }
    except Exception as e:
        return {"error": str(e)}
