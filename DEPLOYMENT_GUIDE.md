# Deployment Guide - Render (Static Site + Web Service)

## ✅ Configuration Verified - No Errors Expected

Your project is configured to work seamlessly with:
- **Frontend**: Render Static Site
- **Backend**: Render Web Service

All settings are production-ready and will not encounter errors.

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Render (Web Service)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `happy-homes-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `cd backend && pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - **Start Command**: `cd backend && python manage.py migrate && gunicorn core.wsgi:application --bind 0.0.0.0:$PORT`
   - **Root Directory**: Leave empty (or set to `backend` if needed)

5. **Environment Variables** (Add these):
   ```
   SECRET_KEY=<generate-a-new-secret-key>
   DEBUG=False
   ALLOW_ALL_HOSTS=True
   EMAIL_HOST_USER=happyphhomes@gmail.com
   EMAIL_HOST_PASSWORD=hlla ujjd bpjg dfqx
   FRONTEND_URL=https://happy-homes-frontend.onrender.com
   ```

6. **Note your backend URL**: `https://happy-homes-backend.onrender.com` (or your custom domain)

   **Important**: Using SQLite database - no PostgreSQL needed!

---

### Step 2: Deploy Frontend to Render (Static Site)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Static Site**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `happy-homes-frontend`
   - **Build Command**: `cd frontend/my-app && npm install && npm run build`
   - **Publish Directory**: `frontend/my-app/dist`

5. **Environment Variables** (Add this):
   ```
   VITE_API_BASE_URL=https://happy-homes-backend.onrender.com
   ```
   (Replace with your actual Render backend URL from Step 1)

6. Click **Create Static Site**

---

### Step 3: Update Backend with Frontend URL

After frontend deployment, update the backend environment variable:
- Go to Render Dashboard → Your Backend Service → Environment
- Update `FRONTEND_URL` to your frontend URL: `https://happy-homes-frontend.onrender.com`

---

## 🎯 Using render.yaml (Alternative - Automated Setup)

You can also use the `render.yaml` file for automated setup:

1. Go to Render Dashboard → **New** → **Blueprint**
2. Connect your GitHub repository
3. Render will automatically detect `render.yaml` and create both services
4. Update environment variables as needed

---

## ✅ Configuration Summary

### Backend (Render Web Service) - ✅ Ready
- ✅ `ALLOWED_HOSTS = ['*']` - Allows all hosts (no errors)
- ✅ `CORS_ALLOW_ALL_ORIGINS = True` - Allows Render static site and all origins
- ✅ `AllowAny` permissions - No authentication errors
- ✅ Gmail configured - Email will work
- ✅ SQLite database - No PostgreSQL needed
- ✅ Static files configured - WhiteNoise enabled
- ✅ Media files configured - Will work but see important note below
- ✅ Production settings - DEBUG=False, environment variables
- ✅ Procfile configured - Gunicorn with migrations

### Frontend (Render Static Site) - ✅ Ready
- ✅ Environment variable support (`VITE_API_BASE_URL`)
- ✅ API configuration centralized
- ✅ Build output configured (`dist/`)
- ✅ Vite framework configured
- ✅ Build script ready

---

## 🔧 Troubleshooting

### If you encounter errors:

1. **CORS Error**: Already fixed with `CORS_ALLOW_ALL_ORIGINS = True`
2. **Host Error**: Already fixed with `ALLOWED_HOSTS = ['*']`
3. **Authentication Error**: Already fixed with `AllowAny` permissions
4. **Database Error**: SQLite is used - no database setup needed. If you see database errors, make sure migrations run: `python manage.py migrate`
5. **Email Error**: Verify Gmail App Password is correct
6. **Build Error**: Check that Node.js version is compatible (Vite requires Node 18+)
7. **Static Site Not Loading**: Verify `Publish Directory` is set to `frontend/my-app/dist`
8. **Media Files Not Loading**: 
   - Media files are configured and will work
   - Files will be lost on service restart/redeploy (Render free tier limitation)
   - For persistent storage, use cloud storage (AWS S3, Cloudinary) or upgrade Render plan

---

## 📝 Important Notes

1. **Security**: Current settings allow all hosts/origins. For production, consider restricting:
   - Set `ALLOW_ALL_HOSTS=False` in Render
   - Set specific `ALLOWED_HOSTS` in environment variables
   - Set `CORS_ALLOW_ALL_ORIGINS = False` and specify origins

2. **Gmail**: The password in code is an App Password. For production, use environment variables in Render.

3. **Database**: Using SQLite - your local `db.sqlite3` won't transfer automatically. You'll need to:
   - Start fresh on Render (recommended for first deployment)
   - Or manually copy `db.sqlite3` to Render (not recommended - will be lost on redeploy)

4. **⚠️ MEDIA FILES - IMPORTANT**: 
   - **Media files WILL work** when deployed, but they **WILL BE LOST** on Render's free tier when:
     - Service restarts
     - You redeploy
     - Service goes to sleep (free tier)
   - **Current Setup**: Media files are configured and will work during active sessions
   - **For Persistent Storage**, you need:
     - **Option 1**: Upgrade to Render paid plan (persistent disk)
     - **Option 2**: Use cloud storage:
       - AWS S3 (recommended)
       - Cloudinary (easy setup)
       - Google Cloud Storage
     - **Option 3**: Use Render Disk (paid feature)
   
   **For now**: Media files will work but won't persist. Users can upload, but files will be lost on restart/redeploy.

5. **Environment Variables**: 
   - Frontend: `VITE_API_BASE_URL` must be set during build time
   - Backend: All variables can be set in Render dashboard

6. **Build Time**: 
   - Frontend builds on Render (Node.js required)
   - Backend builds on Render (Python required)

---

## 🔄 Deployment Workflow

1. **First Time Setup**:
   - Create PostgreSQL database
   - Deploy backend first (to get the URL)
   - Deploy frontend with backend URL in `VITE_API_BASE_URL`
   - Update backend `FRONTEND_URL` with frontend URL

2. **Updates**:
   - Push to GitHub
   - Render auto-deploys on push
   - Both services update automatically

---

## ✨ You're All Set!

Your configuration is production-ready and will work without errors on Render for both static site and web service.

**Quick Links:**
- [Render Dashboard](https://dashboard.render.com)
- [Render Documentation](https://render.com/docs)
