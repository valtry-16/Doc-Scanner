"""
Test script to verify the Redis-free implementation
Run this after installing dependencies
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_imports():
    """Test that all modules can be imported"""
    print("Testing imports...")
    
    try:
        from config import settings
        print("✓ Config loaded")
        
        from core.job_manager import create_job, get_job
        print("✓ Job manager (no Redis!)")
        
        from core.task_processor import get_executor
        print("✓ Task processor (ThreadPoolExecutor)")
        
        from core.cleanup import cleanup_job
        print("✓ Cleanup module")
        
        from workers.image_worker import compress_images_task
        from workers.pdf_worker import compress_pdfs_task
        from workers.ocr_worker import perform_ocr_task
        print("✓ Worker functions (no Celery!)")
        
        from api import compress, convert, merge, ocr, status
        print("✓ API endpoints")
        
        print("\nAll imports successful! ✓")
        return True
        
    except Exception as e:
        print(f"\n✗ Import failed: {e}")
        return False


def test_job_manager():
    """Test job manager functionality"""
    print("\nTesting job manager...")
    
    try:
        from core.job_manager import create_job, get_job, update_job
        
        # Create a test job
        job = create_job("test-123", "compress")
        print(f"✓ Created job: {job['job_id']}")
        
        # Retrieve job
        retrieved = get_job("test-123")
        assert retrieved is not None
        print(f"✓ Retrieved job: {retrieved['status']}")
        
        # Update job
        update_job("test-123", {"status": "processing", "progress": 50})
        updated = get_job("test-123")
        assert updated["progress"] == 50
        print(f"✓ Updated job: progress={updated['progress']}")
        
        print("Job manager tests passed! ✓")
        return True
        
    except Exception as e:
        print(f"✗ Job manager test failed: {e}")
        return False


def test_task_processor():
    """Test task processor"""
    print("\nTesting task processor...")
    
    try:
        from core.task_processor import get_executor, submit_task
        import time
        
        def test_task(x):
            time.sleep(0.1)
            return x * 2
        
        # Get executor
        executor = get_executor()
        print(f"✓ Executor created with {executor._max_workers} workers")
        
        # Submit task
        future = submit_task(test_task, 5)
        result = future.result(timeout=1)
        assert result == 10
        print(f"✓ Task executed: result={result}")
        
        print("Task processor tests passed! ✓")
        return True
        
    except Exception as e:
        print(f"✗ Task processor test failed: {e}")
        return False


if __name__ == "__main__":
    print("=" * 50)
    print("Redis-Free Backend Verification")
    print("=" * 50)
    
    results = []
    results.append(test_imports())
    results.append(test_job_manager())
    results.append(test_task_processor())
    
    print("\n" + "=" * 50)
    if all(results):
        print("All tests passed! ✓")
        print("\nYour Redis-free backend is ready!")
        print("\nNext steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Run backend: uvicorn main:app --reload")
        print("3. Visit: http://localhost:8000/docs")
    else:
        print("Some tests failed. Check errors above.")
        sys.exit(1)
