# Architecture Overview

## System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         User Browser                          │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Next.js Application                                   │  │
│  │  - React Components                                    │  │
│  │  - File Upload UI                                      │  │
│  │  - Progress Tracking                                   │  │
│  │  - File Download                                       │  │
│  └────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ REST API
                         ▼
┌──────────────────────────────────────────────────────────────┐
│              Render (Backend - Web Service)                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  FastAPI Application                                   │  │
│  │  - File Upload Handler                                 │  │
│  │  - Job Management (In-Memory + File Persistence)      │  │
│  │  - Status API                                          │  │
│  │  - Download Handler                                    │  │
│  │  - ThreadPoolExecutor (Background Workers)            │  │
│  │  - Automatic Cleanup Scheduler                        │  │
│  └──────┬─────────────────────────────────────────────────┘  │
└─────────┼────────────────────────────────────────────────────┘
          │
          │ File I/O
          ▼
┌──────────────────────────────────────────────────────────────┐
│              Temporary File Storage (/tmp)                    │
│  - Original Files                                             │
│  - Processed Files                                            │
│  - Job State (JSON)                                           │
│  - Auto-cleanup after 30 minutes                              │
└──────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | Next.js 14 | React framework with SSR and routing |
| **Language** | TypeScript | Type-safe JavaScript |
| **UI Library** | React 18 | Component-based UI |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **HTTP Client** | Fetch API | API communication |
| **State Management** | React Hooks | Local state management |
| **Deployment** | Vercel | Serverless deployment |

### Backend Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | FastAPI | High-performance Python API framework |
| **Language** | Python 3.11+ | Backend logic |
| **Task Queue** | ThreadPoolExecutor | Built-in async task processing |
| **Job Storage** | In-Memory + JSON | Job state management with file persistence |
| **Image Processing** | Pillow, OpenCV | Image manipulation |
| **PDF Processing** | PyPDF2, pdf2image, ReportLab | PDF operations |
| **OCR Engine** | Tesseract | Text extraction |
| **ASGI Server** | Uvicorn | Production ASGI server |
| **Deployment** | Render | Container deployment |

## Component Architecture

### Frontend Components

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── compress/page.tsx    # Compression page
│   ├── convert/page.tsx     # Conversion page
│   ├── merge/page.tsx       # Merge page
│   └── ocr/page.tsx         # OCR page
│
├── components/              # Reusable components
│   ├── FileUploader.tsx    # Drag & drop file upload
│   ├── FilePreview.tsx     # File preview display
│   ├── FeatureSelector.tsx # Feature selection UI
│   ├── JobProgress.tsx     # Progress indicator
│   ├── DownloadButton.tsx  # Download handler
│   └── ErrorAlert.tsx      # Error display
│
├── services/               # API communication layer
│   ├── api.ts             # Base API configuration
│   ├── upload.ts          # Upload service
│   ├── jobStatus.ts       # Status polling service
│   └── download.ts        # Download service
│
├── hooks/                  # Custom React hooks
│   ├── useUpload.ts       # Upload logic
│   ├── useJobStatus.ts    # Status polling logic
│   └── usePolling.ts      # Generic polling hook
│
└── utils/                  # Utility functions
    ├── validators.ts      # Client-side validation
    └── constants.ts       # App constants
```

### Backend Components

```
backend/
├── api/                    # API route handlers
│   ├── compress.py        # Compression endpoints
│   ├── convert.py         # Conversion endpoints
│   ├── merge.py           # Merge endpoints
│   ├── ocr.py            # OCR endpoints
│   └── status.py         # Status endpoints
│
├── workers/               # Background workers
│   ├── celery_app.py     # Celery configuration
│   ├── image_worker.py   # Image processing tasks
│   ├── pdf_worker.py     # PDF processing tasks
│   └── ocr_worker.py     # OCR processing tasks
│
├── core/                  # Core business logic
│   ├── file_detector.py  # File type detection
│   ├── validators.py     # Server-side validation
│   ├── temp_storage.py   # File storage management
│   ├── cleanup.py        # Automatic cleanup
│   └── job_manager.py    # Job state management
│
├── utils/                 # Utility functions
│   ├── pdf_utils.py      # PDF helpers
│   ├── image_utils.py    # Image helpers
│   └── logger.py         # Logging configuration
│
├── config.py             # Application configuration
└── main.py              # FastAPI application entry
```

## Data Flow

### Upload and Process Flow

```
1. User selects file in browser
         ↓
2. Frontend validates file (type, size)
         ↓
3. FormData sent to /api/upload
         ↓
4. Backend saves to temp storage
         ↓
5. Backend creates job record (in-memory + JSON file)
         ↓
6. Backend returns job_id
         ↓
7. Frontend starts operation (compress/convert/etc)
         ↓
8. Backend submits task to ThreadPoolExecutor
         ↓
9. Worker thread picks up task
         ↓
10. Worker processes file
         ↓
11. Worker saves result to temp storage
         ↓
12. Worker updates job status to "completed"
         ↓
13. Frontend polls /api/status/{job_id}
         ↓
14. Frontend receives download_url
         ↓
15. User downloads processed file
         ↓
16. Cleanup job deletes files after 30 min
```

### State Management

**Frontend State:**
- `uploadState`: { status, progress, error }
- `jobState`: { jobId, status, progress, downloadUrl }
- `fileState`: { files, previews }

**Backend State:**
- `In-Memory Dict`: { job_id: { status, progress, result, error } }
- `JSON File`: Persisted job data for recovery after restart

## Scalability Considerations

### Horizontal Scaling

**Frontend:**
- Vercel automatically scales serverless functions
- CDN caching for static assets
- No state stored on frontend servers

**Backend:**
- Multiple FastAPI instances behind load balancer
- Multiple worker threads (adjust MAX_WORKERS)
- Shared file storage (S3/R2) for multi-instance deployments

### Vertical Scaling

**Worker Resources:**
- Increase worker threads (MAX_WORKERS environment variable)
- Add more CPU cores for parallel processing
- Optimize algorithms for better performance

### Performance Optimization

**Frontend:**
- Code splitting with Next.js
- Lazy loading components
- Image optimization
- HTTP/2 multiplexing

**Backend:**
- Connection pooling (if using external storage)
- Async I/O with FastAPI
- Stream large files instead of loading into memory
- Implement caching for repeated operations

## Security Architecture

### Input Validation

**Frontend (First Line):**
- File type checking
- File size validation
- MIME type verification

**Backend (Second Line):**
- Re-validate all inputs
- File signature verification
- Content scanning
- Path traversal prevention

### Data Protection

**In Transit:**
- HTTPS for all communications
- TLS 1.3 encryption

**At Rest:**
- Temporary storage only
- Automatic deletion after TTL
- No permanent data retention

**Access Control:**
- No authentication in MVP
- Future: JWT tokens, API keys
- Rate limiting (future)

## Monitoring & Observability

### Logging

**Frontend:**
- Browser console errors
- Vercel deployment logs
- Error tracking with Sentry (optional)

**Backend:**
- Structured JSON logging
- Request/response logging
- Worker task logging
- Error tracking and alerting

### Metrics

**System Metrics:**
- CPU usage
- Memory usage
- Disk I/O
- Network throughput

**Application Metrics:**
- Upload success rate
- Processing time per operation
- Job queue length
- Error rate

### Health Checks

**Endpoints:**
- `/health` - Basic health check
- `/health/storage` - File storage accessibility
- `/health/workers` - Worker thread pool status

## Deployment Architecture

### Development Environment

```
localhost:3000 (Frontend)
    ↓
localhost:8000 (Backend API + Workers)
    ↓
./temp_uploads (File Storage)
```

### Production Environment

```
your-app.vercel.app (Frontend)
    ↓
your-api.onrender.com (Backend API + Workers)
    ↓
/tmp (Temporary File Storage)
```

## Future Architecture Enhancements

### Phase 2: User Accounts
- Add authentication (JWT)
- User dashboard
- File history
- Usage analytics

### Phase 3: Advanced Features
- Real-time WebSocket updates
- Batch processing
- Advanced PDF operations (rotate, extract pages)
- Custom processing profiles

### Phase 4: Scale-Out
- S3/R2 for permanent storage
- CDN for file downloads
- Dedicated image optimization service
- Distributed job queue (if needed)

### Phase 5: Enterprise
- Rate limiting and quotas
- Team collaboration
- API keys for integrations
- SLA guarantees
- On-premise deployment option

## Conclusion

This architecture prioritizes:
- **Simplicity**: No Redis/Celery - just FastAPI + ThreadPoolExecutor
- **Scalability**: Can grow with demand
- **Reliability**: Fault-tolerant design with job persistence
- **Performance**: Async processing, no blocking
- **Security**: Multiple validation layers
- **Cost-Efficiency**: Free tier friendly, minimal dependencies

The modular design allows for easy replacement or upgrade of any component without affecting the entire system.
