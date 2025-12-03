#!/bin/bash
# Build script for Render backend deployment

# Install dependencies
pip install -r requirements.txt

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate

echo "Backend build completed successfully!"

