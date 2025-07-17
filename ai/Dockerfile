# AI Service Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the AI service port
EXPOSE 5000

# Set environment variables file location (for python-dotenv)
ENV PYTHONUNBUFFERED=1
# Ensure ai package is discoverable
ENV PYTHONPATH="${PYTHONPATH}:/app"

# Start the AI service using module mode for robust imports
# For production, you may use: uvicorn ai.main:app --host 0.0.0.0 --port 5000
# For development, consider using --reload and reload_excludes to avoid watcher spam
CMD ["python", "main.py"]
