# Automated Git Push Script for Happy Homes
# This script will handle everything automatically

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Happy Homes - GitHub Push Script" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if Git is installed
try {
    $gitVersion = git --version 2>&1
    Write-Host "✓ Git found: $gitVersion`n" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Git is not installed or not in PATH!" -ForegroundColor Red
    Write-Host "`nPlease install Git first:" -ForegroundColor Yellow
    Write-Host "1. Download: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "2. Install Git (check 'Add to PATH' during installation)" -ForegroundColor White
    Write-Host "3. Restart PowerShell and run this script again`n" -ForegroundColor White
    Write-Host "Or use GitHub Desktop: https://desktop.github.com/`n" -ForegroundColor Cyan
    exit 1
}

# Get current directory
$projectPath = Get-Location
Write-Host "Project path: $projectPath`n" -ForegroundColor Gray

# Step 1: Initialize Git if needed
if (-not (Test-Path ".git")) {
    Write-Host "[1/6] Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Git repository initialized`n" -ForegroundColor Green
} else {
    Write-Host "[1/6] ✓ Git repository already initialized`n" -ForegroundColor Green
}

# Step 2: Configure remote
Write-Host "[2/6] Configuring remote repository..." -ForegroundColor Yellow
$remoteUrl = "https://github.com/ragnvindr08/happyhomescavite.git"

# Remove existing remote if it exists
git remote remove origin 2>$null

# Add new remote
git remote add origin $remoteUrl
Write-Host "✓ Remote configured: $remoteUrl`n" -ForegroundColor Green

# Step 3: Check current branch
$currentBranch = git branch --show-current 2>$null
if (-not $currentBranch) {
    Write-Host "[3/6] Creating main branch..." -ForegroundColor Yellow
    git checkout -b main
    $currentBranch = "main"
} else {
    Write-Host "[3/6] ✓ Current branch: $currentBranch" -ForegroundColor Green
}
Write-Host ""

# Step 4: Stage all files
Write-Host "[4/6] Staging all files..." -ForegroundColor Yellow
git add .
$stagedFiles = (git status --short | Measure-Object -Line).Lines
Write-Host "✓ Staged $stagedFiles file(s)`n" -ForegroundColor Green

# Step 5: Commit changes
Write-Host "[5/6] Committing changes..." -ForegroundColor Yellow
$commitMessage = "Deploy to Render: Add production configuration and deployment files"
git commit -m $commitMessage
Write-Host "✓ Changes committed`n" -ForegroundColor Green

# Step 6: Push to GitHub
Write-Host "[6/6] Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "Note: You may be prompted for GitHub credentials" -ForegroundColor Gray
Write-Host "Use a Personal Access Token (not password)" -ForegroundColor Gray
Write-Host "Create token at: https://github.com/settings/tokens`n" -ForegroundColor Gray

try {
    git branch -M main
    git push -u origin main
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  ✓ SUCCESS! Code pushed to GitHub" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Cyan
    Write-Host "Repository: $remoteUrl" -ForegroundColor Cyan
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. Go to Render.com" -ForegroundColor White
    Write-Host "2. Connect your GitHub repository" -ForegroundColor White
    Write-Host "3. Deploy backend and frontend services`n" -ForegroundColor White
} catch {
    Write-Host "`n✗ ERROR during push!" -ForegroundColor Red
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "- Authentication failed: Create a Personal Access Token" -ForegroundColor White
    Write-Host "- Repository doesn't exist: Create it on GitHub first" -ForegroundColor White
    Write-Host "- Network error: Check your internet connection`n" -ForegroundColor White
    Write-Host "Error details: $_" -ForegroundColor Red
    exit 1
}

