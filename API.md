# API Documentation

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://your-backend-app.onrender.com`

## Authentication

No authentication required for MVP version.

## Endpoints

### Health Check

Check if the API is running.

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-16T12:00:00Z"
}
```

---

### Upload File

Upload a file for processing.

```http
POST /api/upload
Content-Type: multipart/form-data
```

**Parameters:**
- `file` (required): The file to upload
- `operation` (required): Operation type (`compress`, `convert`, `merge`, `ocr`)

**Response:**
```json
{
  "job_id": "uuid-string",
  "status": "pending",
  "message": "File uploaded successfully"
}
```

**Status Codes:**
- `200 OK`: File uploaded successfully
- `400 Bad Request`: Invalid file or operation
- `413 Payload Too Large`: File exceeds size limit
- `500 Internal Server Error`: Server error

---

### Compress File

Compress an uploaded image or PDF.

```http
POST /api/compress
Content-Type: application/json
```

**Body:**
```json
{
  "job_id": "uuid-string",
  "quality": 85
}
```

**Parameters:**
- `job_id` (required): Job ID from upload
- `quality` (optional): Compression quality 1-100 (default: 85)

**Response:**
```json
{
  "job_id": "uuid-string",
  "status": "processing",
  "message": "Compression started"
}
```

---

### Convert File

Convert a file to another format.

```http
POST /api/convert
Content-Type: application/json
```

**Body:**
```json
{
  "job_id": "uuid-string",
  "target_format": "pdf"
}
```

**Parameters:**
- `job_id` (required): Job ID from upload
- `target_format` (required): Target format (`pdf`, `jpg`, `png`, `webp`, `txt`)

**Response:**
```json
{
  "job_id": "uuid-string",
  "status": "processing",
  "message": "Conversion started"
}
```

**Supported Conversions:**
- Image → Image (JPG ↔ PNG ↔ WebP)
- Image → PDF
- PDF → Image (first page)
- PDF → Text (with OCR)

---

### Merge PDFs

Merge multiple PDF files into one.

```http
POST /api/merge
Content-Type: application/json
```

**Body:**
```json
{
  "job_ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Parameters:**
- `job_ids` (required): Array of job IDs to merge (in order)

**Response:**
```json
{
  "job_id": "new-uuid-string",
  "status": "processing",
  "message": "Merge started"
}
```

---

### OCR (Text Extraction)

Extract text from an image or PDF using OCR.

```http
POST /api/ocr
Content-Type: application/json
```

**Body:**
```json
{
  "job_id": "uuid-string",
  "language": "eng"
}
```

**Parameters:**
- `job_id` (required): Job ID from upload
- `language` (optional): OCR language code (default: `eng`)

**Response:**
```json
{
  "job_id": "uuid-string",
  "status": "processing",
  "message": "OCR started"
}
```

**Supported Languages:**
- `eng`: English
- `spa`: Spanish
- `fra`: French
- `deu`: German
- `chi_sim`: Chinese Simplified

---

### Job Status

Check the status of a processing job.

```http
GET /api/status/{job_id}
```

**Response (Pending):**
```json
{
  "job_id": "uuid-string",
  "status": "pending",
  "progress": 0
}
```

**Response (Processing):**
```json
{
  "job_id": "uuid-string",
  "status": "processing",
  "progress": 45,
  "message": "Compressing image..."
}
```

**Response (Completed):**
```json
{
  "job_id": "uuid-string",
  "status": "completed",
  "progress": 100,
  "download_url": "/api/download/uuid-string",
  "result": {
    "original_size": 1048576,
    "processed_size": 524288,
    "reduction": "50%"
  }
}
```

**Response (Failed):**
```json
{
  "job_id": "uuid-string",
  "status": "failed",
  "progress": 0,
  "error": "Error message here"
}
```

**Status Values:**
- `pending`: Job queued, waiting to start
- `processing`: Job currently being processed
- `completed`: Job finished successfully
- `failed`: Job failed with error

---

### Download File

Download a processed file.

```http
GET /api/download/{job_id}
```

**Response:**
- Binary file content
- Appropriate `Content-Type` header
- `Content-Disposition` header with filename

**Status Codes:**
- `200 OK`: File downloaded
- `404 Not Found`: Job not found or file expired
- `410 Gone`: File has been cleaned up

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message",
  "error_code": "ERROR_CODE",
  "timestamp": "2026-02-16T12:00:00Z"
}
```

### Common Error Codes

- `FILE_TOO_LARGE`: File exceeds maximum size
- `INVALID_FILE_TYPE`: Unsupported file format
- `JOB_NOT_FOUND`: Job ID does not exist
- `PROCESSING_FAILED`: Error during processing
- `FILE_EXPIRED`: File has been cleaned up

---

## Rate Limiting

**MVP Version**: No rate limiting applied.

**Future**: Rate limiting will be added based on IP address or user account.

---

## File Limits

- **Max File Size**: 25 MB
- **File Retention**: 30 minutes
- **Batch Operations**: Up to 10 files for merge
- **Concurrent Jobs**: Unlimited (subject to server resources)

---

## WebSocket Support

**Status**: Not implemented in MVP

**Future**: Real-time progress updates via WebSocket connections.

---

## Examples

### Upload and Compress (JavaScript)

```javascript
// Upload file
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('operation', 'compress');

const uploadResponse = await fetch('http://localhost:8000/api/upload', {
  method: 'POST',
  body: formData
});

const { job_id } = await uploadResponse.json();

// Start compression
await fetch('http://localhost:8000/api/compress', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ job_id, quality: 85 })
});

// Poll for status
const pollStatus = async () => {
  const statusResponse = await fetch(`http://localhost:8000/api/status/${job_id}`);
  const status = await statusResponse.json();
  
  if (status.status === 'completed') {
    window.location.href = `http://localhost:8000/api/download/${job_id}`;
  } else if (status.status === 'processing') {
    setTimeout(pollStatus, 2000);
  }
};

pollStatus();
```

### Convert Image to PDF (Python)

```python
import requests

# Upload image
with open('image.jpg', 'rb') as f:
    files = {'file': f}
    data = {'operation': 'convert'}
    response = requests.post('http://localhost:8000/api/upload', 
                           files=files, data=data)
    job_id = response.json()['job_id']

# Start conversion
requests.post('http://localhost:8000/api/convert',
             json={'job_id': job_id, 'target_format': 'pdf'})

# Poll for completion
import time
while True:
    status = requests.get(f'http://localhost:8000/api/status/{job_id}').json()
    if status['status'] == 'completed':
        # Download result
        result = requests.get(f'http://localhost:8000/api/download/{job_id}')
        with open('output.pdf', 'wb') as f:
            f.write(result.content)
        break
    time.sleep(2)
```

### Merge PDFs (cURL)

```bash
# Upload files
curl -X POST http://localhost:8000/api/upload \
  -F "file=@file1.pdf" \
  -F "operation=merge"
# Returns: {"job_id": "job1"}

curl -X POST http://localhost:8000/api/upload \
  -F "file=@file2.pdf" \
  -F "operation=merge"
# Returns: {"job_id": "job2"}

# Merge
curl -X POST http://localhost:8000/api/merge \
  -H "Content-Type: application/json" \
  -d '{"job_ids": ["job1", "job2"]}'
# Returns: {"job_id": "merge_job"}

# Download
curl -O http://localhost:8000/api/download/merge_job
```

---

## Interactive Documentation

For interactive API documentation, visit:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

These interfaces allow you to test endpoints directly from the browser.

---

## Versioning

Current API Version: **v1**

Breaking changes will result in a new API version (e.g., `/api/v2/`).

---

## Support

For API issues or questions:
- Open a GitHub issue
- Check existing documentation
- Review error messages and logs
