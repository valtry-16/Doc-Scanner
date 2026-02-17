import os
from utils.image_utils import compress_image, convert_image, pdf_to_images
from utils.logger import log_job
from core.job_manager import set_job_status, set_job_result, set_job_error, JobStatus
from core.temp_storage import get_output_path


def compress_images_task(job_id: str, file_paths: list, quality: int = 85):
    """
    Compress multiple images
    
    Args:
        job_id: Job ID
        file_paths: List of file paths to compress
        quality: Compression quality (50-100)
    """
    try:
        log_job(job_id, f"Starting compression of {len(file_paths)} images")
        set_job_status(job_id, JobStatus.PROCESSING, 0)
        
        output_files = []
        total_files = len(file_paths)
        total_original_size = 0
        total_compressed_size = 0
        
        for idx, file_path in enumerate(file_paths):
            filename = os.path.basename(file_path)
            output_filename = f"compressed_{filename}"
            output_path = get_output_path(job_id, output_filename)
            
            original_size = os.path.getsize(file_path)
            success, message = compress_image(file_path, output_path, quality=quality)
            
            if success:
                compressed_size = os.path.getsize(output_path)
                total_original_size += original_size
                total_compressed_size += compressed_size
                output_files.append(output_filename)
                progress = int(((idx + 1) / total_files) * 100)
                set_job_status(job_id, JobStatus.PROCESSING, progress)
            else:
                log_job(job_id, f"Failed to compress {filename}: {message}", "error")
        
        if not output_files:
            raise Exception("No files were successfully compressed")
        
        # Calculate compression ratio
        compression_ratio = ((total_original_size - total_compressed_size) / total_original_size * 100) if total_original_size > 0 else 0
        
        # For single file, return that file; for multiple, could create a zip
        result_filename = output_files[0] if len(output_files) == 1 else output_files[0]
        
        result = {
            "download_url": f"/downloads/{job_id}/{result_filename}",
            "filename": result_filename,
            "file_size": os.path.getsize(get_output_path(job_id, result_filename)),
            "original_size": total_original_size,
            "compressed_size": total_compressed_size,
            "compression_ratio": round(compression_ratio, 1),
            "space_saved": total_original_size - total_compressed_size
        }
        
        set_job_result(job_id, result)
        log_job(job_id, f"Compression completed successfully - Saved {compression_ratio:.1f}% ({total_original_size - total_compressed_size} bytes)")
        
    except Exception as e:
        log_job(job_id, f"Compression failed: {str(e)}", "error")
        set_job_error(job_id, str(e))


def convert_images_task(
    job_id: str,
    file_paths: list,
    target_format: str,
    resize_width: int = None,
    resize_height: int = None,
    keep_aspect: bool = True
):
    """
    Convert images/PDFs to target format
    
    Args:
        job_id: Job ID
        file_paths: List of file paths to convert
        target_format: Target format (jpg, png, webp, pdf)
    """
    try:
        log_job(job_id, f"Starting conversion of {len(file_paths)} file(s) to {target_format}")
        set_job_status(job_id, JobStatus.PROCESSING, 0)
        
        output_files = []
        total_files = len(file_paths)
        
        for idx, file_path in enumerate(file_paths):
            base_name = os.path.splitext(os.path.basename(file_path))[0]
            file_ext = os.path.splitext(file_path)[1].lower()
            
            # Handle PDF to image conversion
            if file_ext == '.pdf' and target_format.lower() != 'pdf':
                output_dir = os.path.dirname(get_output_path(job_id, "temp"))
                success, message, pdf_output_files = pdf_to_images(
                    file_path, 
                    output_dir, 
                    target_format,
                    resize_width=resize_width,
                    resize_height=resize_height,
                    keep_aspect=keep_aspect
                )
                
                if success:
                    # Get just the filenames from full paths
                    for pdf_file in pdf_output_files:
                        output_files.append(os.path.basename(pdf_file))
                else:
                    log_job(job_id, f"Failed to convert PDF {base_name}: {message}", "error")
                    # Don't fail the whole job, just skip this file
            else:
                # Regular image conversion
                output_filename = f"{base_name}.{target_format}"
                output_path = get_output_path(job_id, output_filename)
                
                success, message = convert_image(
                    file_path,
                    output_path,
                    target_format,
                    resize_width=resize_width,
                    resize_height=resize_height,
                    keep_aspect=keep_aspect
                )
                
                if success:
                    output_files.append(output_filename)
                else:
                    log_job(job_id, f"Failed to convert {base_name}: {message}", "error")
            
            progress = int(((idx + 1) / total_files) * 100)
            set_job_status(job_id, JobStatus.PROCESSING, progress)
        
        if not output_files:
            raise Exception("No files were successfully converted")
        
        result_filename = output_files[0] if len(output_files) == 1 else output_files[0]
        
        result = {
            "download_url": f"/downloads/{job_id}/{result_filename}",
            "filename": result_filename,
            "file_size": os.path.getsize(get_output_path(job_id, result_filename)),
            "total_files": len(output_files)
        }
        
        set_job_result(job_id, result)
        log_job(job_id, f"Conversion completed successfully - {len(output_files)} file(s) created")
        
    except Exception as e:
        log_job(job_id, f"Conversion failed: {str(e)}", "error")
        set_job_error(job_id, str(e))
