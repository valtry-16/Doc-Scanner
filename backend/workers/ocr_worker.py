import os
try:
    import pytesseract
    from PIL import Image
    from pdf2image import convert_from_path
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False

from utils.logger import log_job
from core.job_manager import set_job_status, set_job_result, set_job_error, JobStatus
from core.temp_storage import get_output_path
from core.file_detector import is_image_file, is_pdf_file


def perform_ocr_task(job_id: str, file_paths: list):
    """
    Perform OCR on images and PDFs
    
    Args:
        job_id: Job ID
        file_paths: List of file paths to perform OCR on
    """
    try:
        if not TESSERACT_AVAILABLE:
            raise Exception("Tesseract OCR is not installed. Download from: https://github.com/UB-Mannheim/tesseract/wiki and add to PATH. See OCR_SETUP.md for details.")
        
        log_job(job_id, f"Starting OCR on {len(file_paths)} files")
        set_job_status(job_id, JobStatus.PROCESSING, 0)
        
        all_text = []
        total_files = len(file_paths)
        pdf_skipped = False
        
        for idx, file_path in enumerate(file_paths):
            try:
                if is_image_file(file_path):
                    # OCR on image
                    image = Image.open(file_path)
                    text = pytesseract.image_to_string(image)
                    all_text.append(f"=== {os.path.basename(file_path)} ===\n{text}\n")
                    
                elif is_pdf_file(file_path):
                    # Convert PDF to images and OCR (requires poppler)
                    try:
                        images = convert_from_path(file_path)
                        pdf_text = []
                        for page_num, image in enumerate(images):
                            text = pytesseract.image_to_string(image)
                            pdf_text.append(f"Page {page_num + 1}:\n{text}\n")
                        
                        all_text.append(f"=== {os.path.basename(file_path)} ===\n" + "\n".join(pdf_text))
                    except Exception as pdf_error:
                        pdf_skipped = True
                        log_job(job_id, f"Skipping PDF {os.path.basename(file_path)}: Poppler not installed. See OCR_SETUP.md", "warning")
                
                progress = int(((idx + 1) / total_files) * 100)
                set_job_status(job_id, JobStatus.PROCESSING, progress)
                
            except Exception as e:
                log_job(job_id, f"OCR failed for {os.path.basename(file_path)}: {str(e)}", "error")
        
        if not all_text:
            if pdf_skipped:
                raise Exception("No text extracted. PDF OCR requires Poppler. Download from: https://github.com/oschwartz10612/poppler-windows/releases and add to PATH.")
            else:
                raise Exception("No text could be extracted from the files")
        
        # Save extracted text
        output_filename = "extracted_text.txt"
        output_path = get_output_path(job_id, output_filename)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("\n\n".join(all_text))
        
        result = {
            "download_url": f"/downloads/{job_id}/{output_filename}",
            "filename": output_filename,
            "file_size": os.path.getsize(output_path)
        }
        
        set_job_result(job_id, result)
        log_job(job_id, "OCR completed successfully")
        
    except Exception as e:
        log_job(job_id, f"OCR failed: {str(e)}", "error")
        set_job_error(job_id, str(e))
