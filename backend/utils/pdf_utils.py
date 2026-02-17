from PyPDF2 import PdfReader, PdfWriter, PdfMerger
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import os
from typing import List, Tuple


def compress_pdf(input_path: str, output_path: str) -> Tuple[bool, str]:
    """
    Compress a PDF file by removing metadata and optimizing
    
    Args:
        input_path: Path to input PDF
        output_path: Path to save compressed PDF
        
    Returns:
        Tuple of (success, message)
    """
    try:
        reader = PdfReader(input_path)
        writer = PdfWriter()
        
        # Copy all pages
        for page in reader.pages:
            writer.add_page(page)
        
        # Remove metadata
        writer.add_metadata({})
        
        # Write compressed PDF
        with open(output_path, 'wb') as output_file:
            writer.write(output_file)
        
        return True, "PDF compressed successfully"
    except Exception as e:
        return False, f"Failed to compress PDF: {str(e)}"


def merge_pdfs(input_paths: List[str], output_path: str) -> Tuple[bool, str]:
    """
    Merge multiple PDF files into one
    
    Args:
        input_paths: List of paths to input PDFs
        output_path: Path to save merged PDF
        
    Returns:
        Tuple of (success, message)
    """
    try:
        merger = PdfMerger()
        
        for pdf_path in input_paths:
            merger.append(pdf_path)
        
        merger.write(output_path)
        merger.close()
        
        return True, f"Successfully merged {len(input_paths)} PDF files"
    except Exception as e:
        return False, f"Failed to merge PDFs: {str(e)}"


def split_pdf(input_path: str, output_dir: str, page_ranges: List[Tuple[int, int]] = None) -> Tuple[bool, str]:
    """
    Split a PDF into multiple files
    
    Args:
        input_path: Path to input PDF
        output_dir: Directory to save split PDFs
        page_ranges: List of (start, end) page ranges (optional)
        
    Returns:
        Tuple of (success, message)
    """
    try:
        reader = PdfReader(input_path)
        total_pages = len(reader.pages)
        
        if page_ranges is None:
            # Split into individual pages
            page_ranges = [(i, i) for i in range(total_pages)]
        
        output_files = []
        for idx, (start, end) in enumerate(page_ranges):
            writer = PdfWriter()
            
            for page_num in range(start, end + 1):
                if 0 <= page_num < total_pages:
                    writer.add_page(reader.pages[page_num])
            
            output_path = os.path.join(output_dir, f"split_{idx + 1}.pdf")
            with open(output_path, 'wb') as output_file:
                writer.write(output_file)
            
            output_files.append(output_path)
        
        return True, f"PDF split into {len(output_files)} files"
    except Exception as e:
        return False, f"Failed to split PDF: {str(e)}"


def get_pdf_info(pdf_path: str) -> dict:
    """
    Get information about a PDF file
    
    Args:
        pdf_path: Path to PDF file
        
    Returns:
        Dictionary with PDF information
    """
    try:
        reader = PdfReader(pdf_path)
        return {
            "pages": len(reader.pages),
            "metadata": reader.metadata,
            "encrypted": reader.is_encrypted,
        }
    except Exception as e:
        return {"error": str(e)}


def text_to_pdf(text: str, output_path: str) -> Tuple[bool, str]:
    """
    Convert text to PDF
    
    Args:
        text: Text content
        output_path: Path to save PDF
        
    Returns:
        Tuple of (success, message)
    """
    try:
        c = canvas.Canvas(output_path, pagesize=letter)
        width, height = letter
        
        # Simple text wrapping
        lines = text.split('\n')
        y = height - 50
        
        for line in lines:
            if y < 50:
                c.showPage()
                y = height - 50
            
            c.drawString(50, y, line[:100])  # Limit line length
            y -= 15
        
        c.save()
        return True, "Text converted to PDF"
    except Exception as e:
        return False, f"Failed to convert text to PDF: {str(e)}"
