# Media Files Configuration - Render Deployment

## ✅ Media Files Status: CONFIGURED AND WORKING

Your media files are properly configured and **WILL WORK** when deployed to Render.

---

## 📁 Current Configuration

### Backend Settings (`backend/core/settings.py`):
```python
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

### URL Configuration (`backend/core/urls.py`):
```python
# Media files are served in both development and production
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

✅ **Media files will be accessible at**: `https://your-backend.onrender.com/media/`

---

## ⚠️ Important Limitations on Render Free Tier

### What Works:
- ✅ Users can upload files
- ✅ Files are stored in `backend/media/` directory
- ✅ Files are accessible via URLs
- ✅ Files work during active sessions

### What Doesn't Persist:
- ❌ Files are **LOST** when:
  - Service restarts
  - You redeploy
  - Service goes to sleep (free tier auto-sleeps after 15 min inactivity)
  - Service crashes

### Why This Happens:
Render's free tier uses **ephemeral storage** - files are stored in memory/temporary disk that gets wiped on restart.

---

## 🔧 Solutions for Persistent Media Storage

### Option 1: Cloud Storage (Recommended)

#### AWS S3 (Most Popular)
1. Create AWS S3 bucket
2. Install: `pip install django-storages boto3`
3. Update `settings.py`:
```python
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = 'us-east-1'
```

#### Cloudinary (Easiest Setup)
1. Sign up at https://cloudinary.com
2. Install: `pip install django-cloudinary-storage`
3. Update `settings.py`:
```python
INSTALLED_APPS = [
    # ... other apps
    'cloudinary_storage',
    'django.contrib.staticfiles',
]

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY'),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET'),
}
```

### Option 2: Upgrade Render Plan
- **Starter Plan ($7/month)**: Includes persistent disk
- Files will persist across restarts
- No code changes needed

### Option 3: Render Disk (Paid Feature)
- Add persistent disk to your service
- Files stored separately from service

---

## 🚀 For Now (Current Setup)

**Your media files WILL work** with the current configuration:
- ✅ Upload functionality works
- ✅ File serving works
- ✅ URLs are accessible
- ⚠️ Files are temporary (lost on restart)

**This is fine for:**
- Development/testing
- Demo purposes
- Low-traffic sites
- When you don't need file persistence

**You need cloud storage if:**
- Files must persist
- Production environment
- User-generated content
- Important documents/images

---

## 📝 Summary

✅ **Media files are configured correctly**  
✅ **Will work when deployed**  
⚠️ **Files won't persist on free tier**  
💡 **Use cloud storage for production**

Your current setup is ready to deploy and will work - just be aware of the persistence limitation on Render's free tier.

