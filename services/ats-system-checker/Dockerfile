# Backend Service Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
  gcc \
  && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./src ./src

# Create necessary directories
RUN mkdir -p uploads evaluations

# Expose port (Railway will override this with $PORT)
EXPOSE 4000

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH="/app"
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/ats-checker/health/simple || exit 1

# Start the backend service
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "4000"]
