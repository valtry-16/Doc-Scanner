# Document Processing Platform

An open-source web-based document processing platform for compressing, converting, and manipulating PDFs and images.

## 🚀 Quick Deploy

### Deploy to Production (15 minutes)

1. **Backend** → [Deploy to Render](https://render.com) (see [QUICKSTART_DEPLOY.md](QUICKSTART_DEPLOY.md))
2. **Frontend** → [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

📖 **Full deployment guide**: [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Features

- 📁 **Upload** - Drag & drop images and PDFs
- 🗜️ **Compress** - Reduce file sizes for images and PDFs
- 🔄 **Convert** - Transform files between formats
- 📑 **Merge** - Combine multiple PDFs into one
- ✂️ **Split** - Extract pages from PDFs
- 🔍 **OCR** - Extract text from images and PDFs
- ⬇️ **Download** - Get processed files securely
- 🧹 **Auto-cleanup** - Temporary files deleted after 30 minutes

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

### Backend
- **Framework**: FastAPI (Python)
- **Task Queue**: ThreadPoolExecutor (built-in)
- **Image Processing**: Pillow, OpenCV
- **PDF Processing**: PyPDF2, pdf2image, reportlab
- **OCR**: Tesseract, pytesseract
- **Deployment**: Render

## Architecture

```
┌─────────────────┐
│  Vercel         │
│  (Next.js)      │
│  Frontend UI    │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  Render         │
│  FastAPI        │
│  Web Service    │
│  + Background   │
│    Workers      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Temporary      │
│  File Storage   │
└─────────────────┘
```
│  Background     │      │  Message     │
│  Workers        │      │  Broker      │
└─────────────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│  Temporary      │
│  File Storage   │
└─────────────────┘
```

## Project Structure

```
Compressor-Convertor/
├── frontend/           # Next.js frontend
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/# React components
│   │   ├── services/  # API clients
│   │   ├── hooks/     # Custom hooks
│   │   └── utils/     # Utilities
│   └── package.json
│
├── backend/           # FastAPI backend
│   ├── api/          # API endpoints
│   ├── workers/      # Background workers
│   ├── core/         # Core utilities
│   └── main.py
│
└── README.md
```

## Local Development

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **Tesseract OCR** (optional, for OCR features - see [OCR_SETUP.md](OCR_SETUP.md))

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/document-processor.git
   cd document-processor
   ```

2. **Start Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```
   Backend runs at `http://localhost:8000`

3. **Start Frontend** (new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend runs at `http://localhost:3000`

4. **Visit** `http://localhost:3000` \ud83c\udf89

### Environment Variables

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** (`.env`):
```env
UPLOAD_DIR=./temp_uploads
OUTPUT_DIR=./temp_output
MAX_FILE_SIZE_MB=25
FILE_RETENTION_MINUTES=30
MAX_WORKERS=4
CORS_ORIGINS=http://localhost:3000
```

---

## Production Deployment

### Option 1: Quick Deploy (15 min)

\ud83d\ude80 Follow the **[Quick Deploy Guide](QUICKSTART_DEPLOY.md)**

1. Deploy backend to Render
2. Deploy frontend to Vercel
3. Connect them together

### Option 2: Detailed Deployment

\ud83d\udcd6 Follow the **[Full Deployment Guide](DEPLOYMENT.md)** for:
- Step-by-step instructions
- Environment configuration
- Custom domain setup
- Monitoring & troubleshooting
- Production recommendations

### Deployment Platforms

| Component | Platform | Free Tier | Paid Plan |
|-----------|----------|-----------|-----------|
| **Frontend** | Vercel | \u2705 Yes | $20/mo (Pro) |
| **Backend** | Render | \u2705 Yes* | $7/mo (Starter) |

*Free tier sleeps after 15 min inactivity

---
---

## API Documentation

Once the backend is running, visit:

- **Swagger UI**: http://localhost:8000/docs (Interactive API testing)
- **Health Check**: http://localhost:8000/health
- **Root**: http://localhost:8000/ (API info)

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/compress` | POST | Compress images/PDFs with quality control |
| `/api/convert` | POST | Convert images between formats (JPG/PNG/WebP/PDF) |
| `/api/merge` | POST | Merge multiple PDFs into one |
| `/api/ocr` | POST | Extract text from images/PDFs |
| `/api/status/{job_id}` | GET | Check processing status |
| `/downloads/{job_id}/{filename}` | GET | Download processed file |

---

## Features Deep Dive

### \ud83d\uddc2\ufe0f Compress
- **Images**: Adjustable quality (50-100%)
- **PDFs**: Optimize and remove metadata
- **Metrics**: Shows original size, compressed size, % saved
- **Auto-download**: File downloads when ready

### \ud83d\udd04 Convert
- **Supported**: JPG \u2194 PNG \u2194 WebP \u2194 PDF
- **Image \u2192 PDF**: Creates PDF with original dimensions
- **Format validation**: Only accepts image files

### \ud83d\udcc4Merge
- Upload multiple PDFs
- Combines in upload order
- Downloads single merged PDF

### \ud83d\udd0d OCR (Optical Character Recognition)
- **Images**: Works out of the box (requires Tesseract)
- **PDFs**: Requires Poppler (see [OCR_SETUP.md](OCR_SETUP.md))
- **Output**: Plain text file (.txt)

---

## Project Structure

```
document-processor/
\u251c\u2500\u2500 frontend/              # Next.js app
\u2502   \u251c\u2500\u2500 src/
\u2502   \u2502   \u251c\u2500\u2500 app/         # Pages (App Router)
\u2502   \u2502   \u251c\u2500\u2500 components/   # React components
\u2502   \u2502   \u251c\u2500\u2500 services/     # API clients
\u2502   \u2502   \u251c\u2500\u2500 hooks/        # Custom React hooks
\u2502   \u2502   \u2514\u2500\u2500 utils/        # Constants, helpers
\u2502   \u251c\u2500\u2500 package.json
\u2502   \u2514\u2500\u2500 vercel.json     # Vercel config
\u2502
\u251c\u2500\u2500 backend/               # FastAPI app
\u2502   \u251c\u2500\u2500 api/            # API route handlers
\u2502   \u251c\u2500\u2500 workers/        # Background task workers
\u2502   \u251c\u2500\u2500 core/           # Job management, validation
\u2502   \u251c\u2500\u2500 utils/          # Image/PDF processing
\u2502   \u251c\u2500\u2500 main.py         # FastAPI application
\u2502   \u251c\u2500\u2500 config.py       # Settings
\u2502   \u251c\u2500\u2500 requirements.txt
\u2502   \u251c\u2500\u2500 render.yaml     # Render config
\u2502   \u2514\u2500\u2500 build.sh        # Build script
\u2502
\u251c\u2500\u2500 DEPLOYMENT.md       # Full deployment guide
\u251c\u2500\u2500 QUICKSTART_DEPLOY.md # Quick deploy (15 min)
\u251c\u2500\u2500 OCR_SETUP.md        # OCR installation guide
\u2514\u2500\u2500 README.md           # This file
```

---

## Supported Formats

### Input Files
| Type | Formats |
|------|---------|
| Images | JPG, JPEG, PNG, WebP |
| Documents | PDF, DOCX, TXT, HTML |

### Output Files
| Feature | Output Formats |
|---------|---------------|
| Compress | Same as input |
| Convert | JPG, PNG, WebP, PDF |
| Merge | PDF |
| OCR | TXT |

**File Size Limit**: 25 MB per file

---

## Security & Privacy

- \u2705 File size validation (25 MB max)
- \u2705 MIME type checking
- \u2705 Extension whitelist
- \u2705 Auto-cleanup after 30 minutes
- \u2705 No permanent storage
- \u2705 HTTPS in production (Vercel/Render)
- \u2705 CORS protection
- \u2705 Security headers (X-Frame-Options, etc.)

**Privacy**: All files are automatically deleted after 30 minutes. No data is stored permanently.

---

## Performance

### Local Development
- Upload: < 1s
- Processing: 2-30s (depends on file size)
- Download: < 1s

### Production (Free Tier)
- First request: 30-60s (cold start on Render Free)
- Subsequent requests: 2-5s
- **Upgrade to Starter**: No cold starts, instant response

---

---

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.11+)
- Install dependencies: `pip install -r requirements.txt`
- Check port 8000 is available

### Frontend shows connection error
- Verify backend is running at `http://localhost:8000`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS settings in backend `.env`

### File upload fails
- Check file size < 25 MB
- Verify file format is supported
- Check browser console for errors

### OCR not working
- See [OCR_SETUP.md](OCR_SETUP.md) for Tesseract installation
- For PDFs: Also need Poppler

---

## Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit: `git commit -m 'Add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive

---

## Roadmap

### Current Features ✅
- [x] Image compression with quality control
- [x] Image format conversion (JPG/PNG/WebP/PDF)
- [x] PDF merging
- [x] OCR (images and PDFs)
- [x] Auto-download processed files
- [x] Compression metrics display
- [x] Auto-cleanup (30 min)

### Planned Features 🚀
- [ ] User authentication & file history
- [ ] PDF splitting/page extraction
- [ ] Batch processing (multiple files)
- [ ] PDF watermarking
- [ ] Image editing (crop, rotate, resize)
- [ ] Document encryption/decryption
- [ ] Email notifications when processing complete
- [ ] API rate limiting
- [ ] Admin dashboard

---

## Tech Stack Details

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Deployment**: Vercel

### Backend
- **Framework**: FastAPI 0.109+
- **Language**: Python 3.11+
- **Task Processing**: ThreadPoolExecutor (concurrent.futures)
- **Job Storage**: In-memory dict + JSON persistence
- **Image Processing**: Pillow 10.3+, OpenCV
- **PDF Processing**: PyPDF2, pdf2image, reportlab
- **OCR**: Tesseract, pytesseract
- **Deployment**: Render

**Note**: No Redis/Celery required - uses lightweight in-memory job management!

---

## License

MIT License - see [LICENSE](LICENSE) file for details

---

## Support

- 📖 **Documentation**: [DEPLOYMENT.md](DEPLOYMENT.md), [OCR_SETUP.md](OCR_SETUP.md)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/YOUR_USERNAME/document-processor/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/document-processor/discussions)
- 📧 **Email**: your-email@example.com

---

## Acknowledgments

Built with:
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [Next.js](https://nextjs.org/) - React framework
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) - OCR engine
- [Pillow](https://python-pillow.org/) - Image processing
- [PyPDF2](https://pypdf2.readthedocs.io/) - PDF manipulation

---

## Star History

If you find this project useful, please consider giving it a ⭐!

---

**Made with ❤️ by the community**


