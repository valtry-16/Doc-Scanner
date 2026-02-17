from PIL import Image
import os
from typing import Tuple, Optional
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
try:
    from pdf2image import convert_from_path
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False


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


def resize_pil_image(
    img: Image.Image,
    width: Optional[int],
    height: Optional[int],
    keep_aspect: bool
) -> Image.Image:
    if not width and not height:
        return img

    if keep_aspect:
        if width and height:
            img.thumbnail((width, height), Image.LANCZOS)
            return img
        if width:
            ratio = width / img.width
            new_height = max(1, int(img.height * ratio))
            return img.resize((width, new_height), Image.LANCZOS)
        ratio = height / img.height
        new_width = max(1, int(img.width * ratio))
        return img.resize((new_width, height), Image.LANCZOS)

    if not width or not height:
        return img

    return img.resize((width, height), Image.LANCZOS)


def convert_image(
    input_path: str,
    output_path: str,
    target_format: str,
    resize_width: Optional[int] = None,
    resize_height: Optional[int] = None,
    keep_aspect: bool = True
) -> Tuple[bool, str]:
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
            return image_to_pdf(
                input_path,
                output_path,
                resize_width=resize_width,
                resize_height=resize_height,
                keep_aspect=keep_aspect
            )
        
        with Image.open(input_path) as img:
            img = resize_pil_image(img, resize_width, resize_height, keep_aspect)
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


def image_to_pdf(
    input_path: str,
    output_path: str,
    resize_width: Optional[int] = None,
    resize_height: Optional[int] = None,
    keep_aspect: bool = True
) -> Tuple[bool, str]:
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
            img = resize_pil_image(img, resize_width, resize_height, keep_aspect)
            # Convert RGBA to RGB
            if img.mode == 'RGBA':
                img = img.convert('RGB')
            
            # Get image dimensions
            img_width, img_height = img.size
            
            # Create PDF with image dimensions (in points)
            c = canvas.Canvas(output_path, pagesize=(img_width, img_height))
            
            # Draw image on PDF
            c.drawImage(ImageReader(img), 0, 0, width=img_width, height=img_height)
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


def pdf_to_images(
    input_path: str,
    output_dir: str,
    target_format: str = 'jpg',
    dpi: int = 200,
    resize_width: Optional[int] = None,
    resize_height: Optional[int] = None,
    keep_aspect: bool = True
) -> Tuple[bool, str, list]:
    """
    Convert PDF pages to images
    
    Args:
        input_path: Path to input PDF file
        output_dir: Directory to save output images
        target_format: Target image format (jpg, png, webp)
        dpi: DPI for conversion (higher = better quality, larger file)
        
    Returns:
        Tuple of (success, message, list of output file paths)
    """
    if not PDF2IMAGE_AVAILABLE:
        return False, "PDF to image conversion requires poppler-utils to be installed. Please see OCR_SETUP.md for installation instructions.", []
    
    try:
        # Convert PDF to images
        images = convert_from_path(input_path, dpi=dpi)
        
        output_files = []
        base_name = os.path.splitext(os.path.basename(input_path))[0]
        
        for i, image in enumerate(images):
            image = resize_pil_image(image, resize_width, resize_height, keep_aspect)
            # For single page PDFs, don't add page number
            if len(images) == 1:
                output_filename = f"{base_name}.{target_format}"
            else:
                output_filename = f"{base_name}_page_{i+1}.{target_format}"
                
            output_path = os.path.join(output_dir, output_filename)
            
            # Convert RGBA to RGB for JPEG
            if target_format.lower() in ['jpg', 'jpeg'] and image.mode == 'RGBA':
                image = image.convert('RGB')
            
            # Save image
            if target_format.lower() in ['jpg', 'jpeg']:
                image.save(output_path, 'JPEG', quality=95, optimize=True)
            elif target_format.lower() == 'png':
                image.save(output_path, 'PNG', optimize=True)
            elif target_format.lower() == 'webp':
                image.save(output_path, 'WEBP', quality=95)
            else:
                return False, f"Unsupported target format: {target_format}", []
            
            output_files.append(output_path)
        
        return True, f"Successfully converted {len(images)} page(s) to {target_format.upper()}", output_files
    
    except Exception as e:
        return False, f"Failed to convert PDF to images: {str(e)}", []

