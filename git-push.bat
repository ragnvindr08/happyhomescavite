@echo off
REM Git Push Script for Happy Homes Project
REM Run this script after ensuring Git is installed

echo Initializing Git repository...
if not exist ".git" (
    git init
    echo Git repository initialized.
)

echo.
echo Adding/updating remote origin...
git remote remove origin 2>nul
git remote add origin https://github.com/ragnvindr08/happyhomescavite.git

echo.
echo Staging all files...
git add .

echo.
echo Committing changes...
git commit -m "Deploy to Render: Add production configuration and deployment files"

echo.
echo Pushing to GitHub...
git push -u origin main

echo.
echo Done! Your code has been pushed to GitHub.
echo Repository: https://github.com/ragnvindr08/happyhomescavite.git
pause

