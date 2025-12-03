#!/bin/bash
# Build script for Render static site deployment

# Install dependencies
npm install

# Build the app
npm run build

# The dist folder will be served by Render

