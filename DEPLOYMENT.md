# Deployment Guide

This guide walks you through deploying the Document Processing Platform to **Vercel** (frontend) and **Render** (backend).

> **Note**: This platform uses Redis-free architecture with ThreadPoolExecutor for background task processing.

## Quick Start Summary

1. **Deploy Backend** → Render (5-10 min)
2. **Deploy Frontend** → Vercel (2-3 min)
3. **Update Environment Variables** → Connect frontend to backend
4. **Test** → Upload, process, download files

---

## Prerequisites

- GitHub account
- [Vercel account](https://vercel.com) (free tier works)
- [Render account](https://render.com) (free tier works)
- Git installed locally

---

## Part 1: Prepare Your Repository

### 1. Create a GitHub Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Document Processing Platform"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/document-processor.git
git branch -M main
git push -u origin main
```

### 2. Verify Project Structure

```
document-processor/
├── frontend/           # Next.js app
│   ├── src/
│   ├── package.json
│   └── vercel.json    # Vercel config
├── backend/           # FastAPI app
│   ├── api/
│   ├── main.py
│   ├── requirements.txt
│   ├── render.yaml    # Render config
│   └── build.sh       # Build script
├── docker-compose.yml
└── README.md
```

---

## Part 2: Deploy Backend to Render (Do This First!)

Deploy the backend FIRST so you have the API URL for the frontend.

### Step 1: Create Web Service

1. Go to [render.com](https://render.com) and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Search and select your `document-processor` repository

### Step 2: Configure Service

| Setting | Value |
|---------|-------|
| **Name** | `document-processor-api` (or your choice) |
| **Region** | Choose closest to your users (e.g., Oregon, Frankfurt) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | See render.yaml (Tesseract + dependencies) |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` (or `Starter` for production) |

### Step 3: Set Environment Variables

Add these environment variables in Render:

| Variable | Value | Description |
|----------|-------|-------------|
| `UPLOAD_DIR` | `/tmp/uploads` | Temporary upload directory |
| `OUTPUT_DIR` | `/tmp/output` | Processed files directory |
| `MAX_FILE_SIZE_MB` | `25` | Max upload size in MB |
| `FILE_RETENTION_MINUTES` | `30` | Auto-delete after 30 min |
| `MAX_WORKERS` | `2` | Concurrent tasks (free: 2, starter: 4) |
| `TASK_TIMEOUT` | `300` | Task timeout in seconds |
| `CORS_ORIGINS` | `*` | Temporary (update after frontend deploy) |
| `DEBUG` | `false` | Production mode |
| `LOG_LEVEL` | `INFO` | Logging level |

### Step 4: Deploy Backend

1. Click **"Create Web Service"**
2. Wait for build and deployment (5-10 minutes first time)
   - Installing system dependencies (Tesseract, Poppler)
   - Installing Python packages
   - Starting the application
3. Once deployed, note your backend URL:
   ```
   https://document-processor-api.onrender.com
   ```

### Step 5: Verify Backend Deployment

Visit these URLs to confirm:

- **API Docs**: `https://your-backend.onrender.com/docs`
- **Health Check**: `https://your-backend.onrender.com/health`

You should see:
```json
{
  "status": "healthy",
  "message": "Document Processing API is running"
}
```

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select the repository you just pushed

### Step 2: Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `.next` |
| **Install Command** | `npm install` |
| **Node Version** | 18.x or higher |

### Step 3: Set Environment Variables

Add this environment variable **using your actual Render backend URL**:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://document-processor-api.onrender.com` |

**Important**: Replace `document-processor-api` with your actual Render app name!

### Step 4: Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment (2-3 minutes)
3. Once complete, note your frontend URL:
   ```
   https://your-app.vercel.app
   ```

### Step 5: Test Frontend

Visit your Vercel URL and verify:
- ✅ Homepage loads
- ✅ Can navigate to different features
- ✅ UI looks correct

---

## Part 4: Connect Frontend & Backend

### Step 1: Update Backend CORS

1. Go to Render Dashboard → Your Web Service
2. Navigate to **Environment** tab
3. Update `CORS_ORIGINS` with your Vercel URL:
   ```
   https://your-app.vercel.app
   ```
   Or for multiple domains:
   ```
   https://your-app.vercel.app,https://www.yourdomain.com
   ```
4. Click **"Save Changes"**
5. Service will automatically redeploy (~1-2 minutes)

### Step 2: Test Full Integration

Now test the complete workflow:

1. Go to your Vercel URL
2. Click **"Compress"** feature
3. Upload an image (under 25 MB)
4. Adjust quality slider (50-100%)
5. Click **"Compress"**
6. Wait for processing to complete
7. File should auto-download
8. Check compression metrics displayed

**If it works** → ✅ Deployment successful! 🎉

**If errors occur** → See troubleshooting section below

---

## Part 5: Verify All Features

Test each feature to ensure everything works:

### ✅ Compress
- Upload image → Adjust quality → Compress → Download
- Verify compression metrics show (original size, compressed size, % saved)

### ✅ Convert
- Upload image → Select target format (JPG/PNG/WebP/PDF) → Convert → Download

### ✅ OCR
- **Images**: Upload PNG/JPG → Extract text → Download .txt file
- **PDFs**: Requires Tesseract + Poppler (see OCR_SETUP.md)

### ✅ Merge
- Upload multiple PDFs → Merge → Download combined PDF

---

---

## Part 6: Monitoring & Troubleshooting

### Monitor Your Services

**Frontend (Vercel)**:
- Dashboard → Your Project → Deployments
- View build logs and runtime logs
- Check analytics for traffic

**Backend (Render)**:
- Dashboard → Your Service → Logs
- Monitor real-time request logs
- Check metrics (CPU, Memory, Response Time)

### Common Issues & Solutions

#### 🔴 Backend takes long to start

**Reason**: First deployment installs Tesseract, Poppler, and Python packages

**Solution**: 
- First build: 10-15 minutes (normal)
- Subsequent builds: 2-5 minutes
- Free tier: Service sleeps after 15 min inactivity, takes ~30s to wake up

---

#### 🔴 CORS Error in Browser Console

**Error**: `Access-Control-Allow-Origin` error

**Solution**:
1. Check backend `CORS_ORIGINS` environment variable includes your frontend URL
2. No trailing slashes: ✅ `https://app.vercel.app` ❌ `https://app.vercel.app/`
3. Update and redeploy backend if needed

---

#### 🔴 File Upload Fails

**Possible Causes**:
- File > 25 MB
- Network timeout
- Backend is sleeping (free tier)

**Solution**:
1. Check file size: Max 25 MB
2. Wait for backend to wake up (~30s on free tier)
3. Check browser console for errors
4. Verify backend `/health` endpoint returns 200

---

#### 🔴 OCR Not Working

**Error**: "Tesseract OCR is not installed"

**Solution**:
1. Check `backend/build.sh` includes Tesseract installation
2. Redeploy backend service
3. For PDF OCR: Need Poppler (see OCR_SETUP.md)
4. For images: Should work with just Tesseract

---

#### 🔴 Download Button Not Working

**Possible Causes**:
- File cleaned up (>30 min old)
- Download URL incorrect

**Solution**:
1. Files auto-delete after 30 minutes
2. Check browser console for 404 errors
3. Try refreshing and re-processing

---

#### 🔴 Environment Variables Not Working

**Solution**:
1. **Vercel**: Settings → Environment Variables → Redeploy
2. **Render**: Environment tab → Save Changes → Auto-redeploys
3. Verify variable names match exactly (case-sensitive)

---

### View Logs

**Backend Logs (Render)**:
```bash
# Live logs in Render Dashboard or use CLI
curl https://your-backend.onrender.com/health
```

**Frontend Logs (Vercel)**:
- Vercel Dashboard → Deployments → View Function Logs
- Or use Vercel CLI: `vercel logs`

---

### Health Check Endpoints

Test these endpoints to verify services:

```bash
# Backend Health
https://your-backend.onrender.com/health

# Backend API Docs
https://your-backend.onrender.com/docs

# Test Compress Endpoint
curl -X POST https://your-backend.onrender.com/api/compress \
  -F "files=@test.jpg" \
  -F "quality=85"
```

---

---

## Part 7: Production Recommendations

### Free Tier Limitations

**Render Free Tier**:
- ⏰ Service sleeps after 15 min inactivity
- ⚡ 30-60 second cold start when waking
- 💾 750 hours/month free compute  
- 🔄 Limited concurrent requests

**Recommendation**: Upgrade to Starter ($7/mo) for:
- ✅ Always-on (no sleep)
- ✅ Instant response times
- ✅ SSL certificate included
- ✅ Better performance

### Performance Optimizations

1. **Adjust MAX_WORKERS** based on plan:
   - Free: `MAX_WORKERS=1`
   - Starter: `MAX_WORKERS=2-4`
   - Standard+: `MAX_WORKERS=4-8`

2. **Enable Compression** (already configured in vercel.json)

3. **Monitor Response Times**:
   - Upload: < 2s
   - Processing: 5-30s depending on file size
   - Download: < 1s

4. **Consider Adding**:
   - Sentry for error tracking
   - LogRocket for session replay
   - Cloudflare for additional CDN/security

### Security Checklist

- [x] CORS configured correctly
- [x] HTTPS enabled (automatic on Vercel/Render)
- [x] File size limits enforced (25 MB)
- [x] Auto-cleanup of temporary files (30 min)
- [x] Security headers added (vercel.json)
- [ ] Rate limiting (consider adding for production)
- [ ] Web Application Firewall (Cloudflare optional)

### Scaling Strategy

**As your traffic grows**:

1. **0-100 users/day**: Free tier is fine
2. **100-1,000 users/day**: Upgrade Render to Starter ($7/mo)
3. **1,000-10,000 users/day**: 
   - Render Standard ($25/mo)
   - Consider Redis for caching (optional)
   - Add S3/R2 for permanent storage
4. **10,000+ users/day**:
   - Render Pro ($85/mo) or multiple instances
   - Load balancer
   - CDN for processed files
   - Separate processing workers

---

## Part 8: Cost Estimation

### Free Tier (Perfect for Testing/Personal Use)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby | $0 |
| Render Web Service | Free | $0 |
| **Total** | | **$0/month** |

**Limitations**:
- 750 hours/month compute (Render)
- Service sleeps after 15 min inactivity
- 30-60s cold start time

---

### Production Tier (Recommended for Real Users)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby/Pro | $0-20 |
| Render Web Service | Starter | $7 |
| **Total** | | **$7-27/month** |

**Benefits**:
- Always-on backend
- No sleep/cold starts
- SSL certificates
- Better performance

---

### Enterprise Tier (High Traffic)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Pro | $20 |
| Render Web Service | Standard | $25 |
| Optional: Render Redis | Shared | $10 |
| Optional: S3 Storage | Variable | ~$5 |
| **Total** | | **$45-60/month** |

---

## Part 9: Continuous Deployment

### Automatic Deployments

Both Vercel and Render support automatic deployments from GitHub:

**Vercel (Frontend)**:
- Push to `main` branch → Auto-deploy to production
- Push to other branches → Preview deployments
- Pull requests → Automatic preview URLs

**Render (Backend)**:
- Push to `main` branch → Auto-build and deploy
- Typically takes 2-5 minutes
- Zero-downtime deployments

### Deployment Workflow

```bash
# Make changes locally
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin main

# Vercel and Render automatically:
# 1. Detect push
# 2. Run builds
# 3. Deploy if successful
# 4. Notify you via email
```

### Environment-specific Configuration

**Development**: 
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Production** (set in Vercel):
```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

---

## Part 10: Backup & Maintenance

### Backup Strategy

**Code**: GitHub repository (already backed up)

**Environment Variables**:
- Export from Vercel dashboard
- Document in `.env.example` files
- Store securely (1Password, etc.)

**Temporary Files**: None (auto-deleted after 30 min)

### Maintenance Tasks

**Weekly**:
- [ ] Check error logs in Render/Vercel
- [ ] Monitor response times
- [ ] Review storage usage

**Monthly**:
- [ ] Update dependencies (`npm audit`, `pip list --outdated`)
- [ ] Review costs and usage
- [ ] Check for security advisories

**As Needed**:
- [ ] Update Python/Node versions
- [ ] Add new features
- [ ] Optimize performance

---

## Part 11: Custom Domain (Optional)

### Add Custom Domain to Vercel

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `myapp.com`)
3. Add DNS records as instructed:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
4. SSL certificate auto-generated

### Add Custom Domain to Render

1. Render Dashboard → Your Service → Settings → Custom Domain
2. Add domain (e.g., `api.myapp.com`)
3. Add DNS records:
   ```
   Type: CNAME
   Name: api
   Value: your-service.onrender.com
   ```
4. Update `CORS_ORIGINS` to include new domain

---

## Congratulations! 🎉

Your document processing platform is now live and accessible worldwide!

### Next Steps

1. ✅ Share your app with users
2. ✅ Monitor usage and performance
3. ✅ Gather feedback
4. ✅ Iterate and improve
5. ✅ Consider upgrading to paid tiers for better performance

### Support & Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Next.js Docs**: https://nextjs.org/docs

### Report Issues

If you encounter problems:
1. Check troubleshooting section above
2. Review service status pages (Vercel/Render)
3. Check application logs
4. Open GitHub issue with details

---

**Happy Deploying! 🚀**

- No permanent storage in MVP
- For future: Set up automated backups

## Cost Estimation

### Free Tier
- **Vercel**: Free (hobby plan)
- **Render Web Service**: Free (sleeps after inactivity)
- **Render Worker**: Free (750 hours/month)
- **Render Redis**: Free (25 MB)
- **Total**: $0/month

### Production (Recommended)
- **Vercel**: Free or Pro ($20/month for team)
- **Render Web Service**: Starter ($7/month)
- **Render Worker**: Starter ($7/month)
- **Render Redis**: Shared ($10/month)
- **Total**: ~$24-44/month

## Support

If you encounter issues:

1. Check Render/Vercel status pages
2. Review application logs
3. CTotal**: $0/month

### Production (Recommended)
- **Vercel**: Free or Pro ($20/month for team)
- **Render Web Service**: Starter ($7/month)
- **Total**: ~$7-27 and alerts
3. Create user documentation
4. Plan feature roadmap
5. Gather user feedback
6. Iterate and improve

Congratulations! Your document processing platform is now live! 🎉
