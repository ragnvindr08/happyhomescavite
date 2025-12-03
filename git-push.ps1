# Git Push Script for Happy Homes Project
# Run this script in PowerShell after ensuring Git is installed

Write-Host "Initializing Git repository..." -ForegroundColor Green

# Initialize git if not already initialized
if (-not (Test-Path ".git")) {
    git init
    Write-Host "Git repository initialized." -ForegroundColor Green
}

# Add remote (will update if already exists)
Write-Host "Adding/updating remote origin..." -ForegroundColor Green
git remote remove origin 2>$null
git remote add origin https://github.com/ragnvindr08/happyhomescavite.git

# Check current branch
$currentBranch = git branch --show-current 2>$null
if (-not $currentBranch) {
    git checkout -b main
    $currentBranch = "main"
}

Write-Host "Current branch: $currentBranch" -ForegroundColor Yellow

# Add all files
Write-Host "Staging all files..." -ForegroundColor Green
git add .

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Green
$commitMessage = "Deploy to Render: Add production configuration and deployment files"
git commit -m $commitMessage

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Green
git push -u origin $currentBranch

Write-Host "`nDone! Your code has been pushed to GitHub." -ForegroundColor Green
Write-Host "Repository: https://github.com/ragnvindr08/happyhomescavite.git" -ForegroundColor Cyan

