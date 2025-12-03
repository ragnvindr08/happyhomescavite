# Push to GitHub - Step by Step Guide

## ⚠️ IMPORTANT: Git is not installed on your system

You need to install Git first before you can push to GitHub.

---

## OPTION 1: Install Git and Push (Recommended)

### Step 1: Install Git
1. Download Git for Windows: https://git-scm.com/download/win
2. Run the installer
3. **IMPORTANT**: During installation, check "Add Git to PATH"
4. Complete the installation

### Step 2: Restart Your Terminal
- Close this PowerShell window
- Open a NEW PowerShell window
- Navigate back to your project:
  ```powershell
  cd "C:\Users\Admin\Documents\CAPSTONE-03\Capstone Final Oct\Capstone Final\happy_homes"
  ```

### Step 3: Push to GitHub
Run these commands one by one:

```powershell
# Initialize git repository (if not already done)
git init

# Add your GitHub repository as remote
git remote add origin https://github.com/ragnvindr08/happyhomescavite.git

# If remote already exists, remove it first:
# git remote remove origin
# git remote add origin https://github.com/ragnvindr08/happyhomescavite.git

# Stage all files
git add .

# Commit your changes
git commit -m "Deploy to Render: Add production configuration and deployment files"

# Set main branch
git branch -M main

# Push to GitHub (you'll be asked for credentials)
git push -u origin main
```

**Note**: When you run `git push`, you'll need to authenticate:
- Use a Personal Access Token (not your password)
- Generate one at: https://github.com/settings/tokens
- Select scope: `repo` (full control of private repositories)

---

## OPTION 2: Use GitHub Desktop (Easier GUI Method)

1. Download GitHub Desktop: https://desktop.github.com/
2. Install and sign in with your GitHub account
3. In GitHub Desktop:
   - Click "File" → "Add Local Repository"
   - Browse to: `C:\Users\Admin\Documents\CAPSTONE-03\Capstone Final Oct\Capstone Final\happy_homes`
   - Click "Add Repository"
   - Click "Publish repository" button
   - Repository name: `happyhomescavite`
   - Owner: `ragnvindr08`
   - Make sure "Keep this code private" is unchecked (or checked, your choice)
   - Click "Publish Repository"

---

## OPTION 3: Manual Upload via GitHub Website

1. Go to: https://github.com/new
2. Repository name: `happyhomescavite`
3. Make it Public or Private (your choice)
4. Click "Create repository"
5. On the next page, click "uploading an existing file"
6. Drag and drop your project folder contents
7. Add commit message: "Initial commit with Render deployment config"
8. Click "Commit changes"

---

## After Pushing to GitHub

Once your code is on GitHub, you can:
1. Go to Render.com
2. Connect your GitHub account
3. Select the repository: `ragnvindr08/happyhomescavite`
4. Deploy backend and frontend as separate services

---

## Quick Git Installation Link
👉 https://git-scm.com/download/win

