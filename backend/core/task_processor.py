"""
Background task processor without Celery/Redis
Uses ThreadPoolExecutor for async task execution
"""

import threading
from concurrent.futures import ThreadPoolExecutor, Future
from typing import Callable, Any, Dict
from config import settings
from utils.logger import logger

# Global thread pool
_executor: ThreadPoolExecutor = None
_executor_lock = threading.Lock()


def get_executor() -> ThreadPoolExecutor:
    """Get or create the global executor"""
    global _executor
    if _executor is None:
        with _executor_lock:
            if _executor is None:
                _executor = ThreadPoolExecutor(
                    max_workers=settings.MAX_WORKERS,
                    thread_name_prefix="task_worker"
                )
                logger.info(f"Task executor initialized with {settings.MAX_WORKERS} workers")
    return _executor


def submit_task(func: Callable, *args, **kwargs) -> Future:
    """
    Submit a task to the thread pool
    
    Args:
        func: Function to execute
        *args: Positional arguments
        **kwargs: Keyword arguments
        
    Returns:
        Future object
    """
    executor = get_executor()
    future = executor.submit(func, *args, **kwargs)
    return future


def shutdown_executor(wait: bool = True):
    """Shutdown the executor gracefully"""
    global _executor
    if _executor is not None:
        logger.info("Shutting down task executor")
        _executor.shutdown(wait=wait)
        _executor = None
