import asyncio
from core.temp_storage import cleanup_old_files
from core.job_manager import cleanup_old_jobs
from config import settings
from utils.logger import logger


async def cleanup_job():
    """Scheduled cleanup job"""
    logger.info("Starting cleanup job...")
    
    try:
        # Clean upload directory
        cleanup_old_files(settings.UPLOAD_DIR, settings.FILE_RETENTION_MINUTES)
        
        # Clean output directory
        cleanup_old_files(settings.OUTPUT_DIR, settings.FILE_RETENTION_MINUTES)
        
        # Clean old jobs from memory
        cleanup_old_jobs()
        
        logger.info("Cleanup job completed")
    except Exception as e:
        logger.error(f"Cleanup job failed: {e}")


async def schedule_cleanup():
    """Run cleanup periodically"""
    logger.info("Cleanup scheduler started - running every 10 minutes")
    
    while True:
        try:
            await asyncio.sleep(600)  # 10 minutes
            await cleanup_job()
        except asyncio.CancelledError:
            logger.info("Cleanup scheduler stopped")
            break
        except Exception as e:
            logger.error(f"Cleanup scheduler error: {e}")

