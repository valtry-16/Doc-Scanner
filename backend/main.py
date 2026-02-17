from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import asyncio
from contextlib import asynccontextmanager

from config import settings
from api import compress, convert, merge, ocr, status
from core.task_processor import get_executor, shutdown_executor
from core.cleanup import schedule_cleanup


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    # Startup
    print("Starting Document Processor API...")
    get_executor()  # Initialize thread pool
    
    # Start cleanup scheduler in background
    cleanup_task = asyncio.create_task(schedule_cleanup())
    
    yield
    
    # Shutdown
    print("Shutting down Document Processor API...")
    cleanup_task.cancel()
    shutdown_executor(wait=True)


# Create directories
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.OUTPUT_DIR, exist_ok=True)

# Initialize FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for downloads
app.mount("/downloads", StaticFiles(directory=settings.OUTPUT_DIR), name="downloads")

# Include routers
app.include_router(compress.router, prefix="/api", tags=["compress"])
app.include_router(convert.router, prefix="/api", tags=["convert"])
app.include_router(merge.router, prefix="/api", tags=["merge"])
app.include_router(ocr.router, prefix="/api", tags=["ocr"])
app.include_router(status.router, prefix="/api", tags=["status"])


@app.get("/")
async def root():
    return {
        "message": "Document Processor API",
        "version": settings.API_VERSION,
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "message": "Document Processing API is running",
        "version": settings.API_VERSION,
        "features": ["compress", "convert", "merge", "ocr"],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
