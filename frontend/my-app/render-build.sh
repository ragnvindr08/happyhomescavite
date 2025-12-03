#!/bin/bash
# Build script for Render static site

echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

echo "Build completed! Output in dist/"

