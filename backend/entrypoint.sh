#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Run migrations
echo "Applying database migrations..."
python manage.py migrate

# Collect static files (needed for Whitenoise)
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start server based on DEBUG mode
if [ "$DEBUG" = "True" ]; then
    echo "Starting Development server (runserver)..."
    python manage.py runserver 0.0.0.0:8000
else
    echo "Starting Production server (Gunicorn)..."
    exec gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3
fi
