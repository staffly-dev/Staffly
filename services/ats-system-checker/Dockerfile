# Backend Service Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./src ./src

# Copy uploads directory for local file serving
COPY ./uploads ./uploads

# Expose the backend API port
EXPOSE 4000

# Set environment variables file location (for python-dotenv)
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH="/app:/app/ai"

# Start the backend service using module mode for robust imports
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "4000"]
# For production, you may use: uvicorn src.main:app --host 0.0.0.0 --port 4000
# For development, consider using --reload and reload_excludes to avoid watcher spam
