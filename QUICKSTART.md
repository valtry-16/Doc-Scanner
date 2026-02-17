# Quick Start Guide (No Redis Required!)

This document provides a simplified setup guide for the Document Processing Platform without Redis dependencies.

## Prerequisites

- **Node.js 18+** and npm
- **Python 3.11+**
- **Tesseract OCR** (optional, for OCR features)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/document-processor.git
cd document-processor
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux

# Create temp directories
mkdir temp_uploads temp_output
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
copy .env.example .env.local  # Windows
# cp .env.example .env.local  # macOS/Linux
```

## Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux
uvicorn main:app --reload
```

Backend runs at: http://localhost:8000
API Docs: http://localhost:8000/docs

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

Frontend runs at: http://localhost:3000

## Testing

1. Open http://localhost:3000
2. Upload a file
3. Choose an operation (compress, convert, etc.)
4. Wait for processing
5. Download the result

## Key Features

✅ **No Redis** - Uses in-memory job queue with file persistence
✅ **No Celery** - Uses Python's ThreadPoolExecutor for background tasks
✅ **Simple Setup** - Just backend and frontend, no additional services
✅ **Auto-cleanup** - Files auto-deleted after 30 minutes
✅ **Thread-safe** - Concurrent request handling

## Troubleshooting

### Port Already in Use

```bash
# Change port for backend
uvicorn main:app --reload --port 8001

# Change port for frontend (update next.config.js)
```

### Module Not Found

```bash
# Make sure virtual environment is activated
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

### OCR Not Working

```bash
# Install Tesseract OCR
# Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
# macOS: brew install tesseract
# Linux: sudo apt-get install tesseract-ocr
```

## Environment Variables

### Backend (.env)

```env
UPLOAD_DIR=./temp_uploads
OUTPUT_DIR=./temp_output
MAX_FILE_SIZE_MB=25
FILE_RETENTION_MINUTES=30
MAX_WORKERS=4
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Project Structure

```
document-processor/
├── backend/
│   ├── api/          # REST API endpoints
│   ├── core/         # Business logic
│   ├── workers/      # Background task functions
│   ├── utils/        # Helper functions
│   ├── main.py       # FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/      # Next.js pages
│   │   ├── components/
│   │   ├── services/
│   │   └── hooks/
│   └── package.json
└── README.md
```

## Next Steps

- Deploy to production (see [DEPLOYMENT.md](DEPLOYMENT.md))
- Customize processing settings
- Add more features
- Contribute to the project

## Support

For issues and questions:
- Check [README.md](README.md) for full documentation
- Review API docs at http://localhost:8000/docs
- Open a GitHub issue

Enjoy your simplified document processing platform! 🎉
