# Quick Deploy Guide

Deploy your Document Processing Platform in **15 minutes**!

## Prerequisites

- [x] GitHub account
- [x] [Vercel account](https://vercel.com/signup) (free)
- [x] [Render account](https://render.com/register) (free)

---

## Step 1: Push to GitHub (2 min)

```bash
# Clone or navigate to your project
cd Compressor-Convertor

# Initialize git (if not already done)
git add .
git commit -m "Initial deploy"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/document-processor.git
git push -u origin main
```

---

## Step 2: Deploy Backend to Render (5-10 min)

### Option A: Using render.yaml (Recommended)

1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect GitHub repository
4. Select `backend/render.yaml`
5. Click **"Apply"**
6. Wait for deployment (~10 min)
7. Copy your backend URL: `https://YOUR-APP.onrender.com`

### Option B: Manual Setup

1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository
4. Configure:
   - **Name**: `document-processor-api`
   - **Root Directory**: `backend`
   - **Build Command**: `apt-get update && apt-get install -y tesseract-ocr poppler-utils && pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

5. Add environment variables:
   ```
   UPLOAD_DIR=/tmp/uploads
   OUTPUT_DIR=/tmp/output
   MAX_FILE_SIZE_MB=25
   CORS_ORIGINS=*
   ```

6. Click **"Create Web Service"**

---

## Step 3: Deploy Frontend to Vercel (2 min)

### Quick Deploy Button (Easiest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/document-processor&project-name=document-processor&env=NEXT_PUBLIC_API_URL&root-directory=frontend)

### Manual Setup

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Environment Variable**:
     - `NEXT_PUBLIC_API_URL` = `https://YOUR-BACKEND.onrender.com`
4. Click **"Deploy"**
5. Copy your frontend URL: `https://YOUR-APP.vercel.app`

---

## Step 4: Connect Frontend & Backend (1 min)

1. Go to Render Dashboard → Your Service → Environment
2. Update `CORS_ORIGINS`:
   ```
   https://YOUR-APP.vercel.app
   ```
3. Click **"Save Changes"** (auto-redeploys)

---

## Step 5: Test Your Deployment (1 min)

1. Visit your Vercel URL: `https://YOUR-APP.vercel.app`
2. Try the **Compress** feature:
   - Upload an image
   - Adjust quality slider
   - Click "Compress"
   - Download the result

✅ **Success!** Your app is live!

---

## Deployment URLs

After deployment, you'll have:

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `https://YOUR-APP.vercel.app` | User interface |
| Backend API | `https://YOUR-BACKEND.onrender.com` | Processing API |
| API Docs | `https://YOUR-BACKEND.onrender.com/docs` | Interactive API documentation |
| Health Check | `https://YOUR-BACKEND.onrender.com/health` | Service status |

---

## Troubleshooting

### Backend takes 10+ minutes to build
✅ **Normal!** First deploy installs Tesseract, Poppler, and dependencies.

### CORS error in console
❌ Make sure `CORS_ORIGINS` in Render includes your Vercel URL

### Backend is slow to respond
⚠️ Free tier sleeps after 15 min inactivity. First request takes 30-60s to wake up.
**Solution**: Upgrade to Render Starter ($7/mo) for always-on service.

### OCR not working
❌ Check build logs for Tesseract installation errors
✅ See [OCR_SETUP.md](OCR_SETUP.md) for details

---

## What's Next?

### Recommended Upgrades

**For Production** (~$7/month):
- Upgrade Render to **Starter Plan** for always-on service
- No sleep mode = instant responses
- Better for real users

### Add Custom Domain

1. **Frontend**: Vercel Settings → Domains → Add `myapp.com`
2. **Backend**: Render Settings → Custom Domain → Add `api.myapp.com`

### Monitor Performance

- **Vercel**: Analytics dashboard (free)
- **Render**: Metrics tab (CPU, memory, requests)

---

## Cost Summary

| Plan | Services | Monthly Cost |
|------|----------|--------------|
| **Free Tier** | Vercel Free + Render Free | $0 |
| **Production** | Vercel Free + Render Starter | $7 |
| **Pro** | Vercel Pro + Render Standard | $45 |

---

## Need Help?

- 📖 Full deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- 🔍 OCR setup: [OCR_SETUP.md](OCR_SETUP.md)
- 🐛 Report issues: GitHub Issues
- 📧 Questions: Check Vercel/Render docs

---

**Enjoy your deployed Document Processing Platform! 🎉**
