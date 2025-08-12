# 🚀 AI Service Troubleshooting and Deployment Guide

## Overview

This document provides comprehensive guidance for troubleshooting common issues and deploying the AI Service in various environments. It covers development, testing, and production deployment scenarios.

## 🔧 Development Environment Setup

### Prerequisites

- **Python**: 3.9+ (recommended: 3.11+)
- **pip**: Latest version
- **Virtual Environment**: Python venv or conda
- **Git**: For version control

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd Staffly/ai

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp env.template .env
# Edit .env with your configuration
```

### Environment Configuration

**Required Variables**:
```bash
# AI Service Configuration
COHERE_API_KEY=your_cohere_api_key_here

# Server Configuration
AI_HOST=0.0.0.0
AI_PORT=5000

# CORS Configuration
CORS_ALLOW_ORIGINS=http://localhost:3000,http://localhost:4000
CORS_ALLOW_CREDENTIALS=true

# API Documentation Authentication
DOCS_USERNAME=your_secure_username
DOCS_PASSWORD=your_secure_password
DOCS_AUTH_ENABLED=true
```

**Optional Variables**:
```bash
# Logging
LOG_LEVEL=INFO

# Development
DEBUG=true
```

## 🐛 Common Issues and Solutions

### 1. Import/Module Errors

**Problem**: `ModuleNotFoundError` or import errors

**Symptoms**:
```
ModuleNotFoundError: No module named 'services.cohere_service'
ImportError: cannot import name 'EvaluationResult'
```

**Solutions**:

**Option A: Run as Module (Recommended)**
```bash
# From project root (Staffly/)
python -m ai.main
```

**Option B: Fix Python Path**
```bash
# From ai/ directory
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
python main.py
```

**Option C: Use Uvicorn with Module Path**
```bash
# From project root
uvicorn ai.main:app --reload --host 0.0.0.0 --port 5000
```

**Prevention**:
- Always run from the project root directory
- Use `python -m ai.main` for robust imports
- Ensure virtual environment is activated

### 2. Cohere API Key Issues

**Problem**: AI service fails to initialize

**Symptoms**:
```
AI service not initialized
Failed to generate CV evaluation
Failed to generate quiz questions
```

**Solutions**:

**Check API Key**:
```bash
# Verify in .env file
cat .env | grep COHERE_API_KEY

# Test API key validity
curl -H "Authorization: Bearer YOUR_API_KEY" \
  https://api.cohere.com/v1/models
```

**Environment Variable Loading**:
```bash
# Ensure .env file is in correct location
ls -la .env

# Check if dotenv is loading correctly
python -c "import os; print(os.getenv('COHERE_API_KEY'))"
```

**Prevention**:
- Verify API key is valid and has sufficient credits
- Ensure .env file is in the `ai/` directory
- Check API key permissions and rate limits

### 3. File Upload Issues

**Problem**: Document processing fails

**Symptoms**:
```
Unsupported file type. Allowed: pdf,docx
Failed to extract text from document
```

**Solutions**:

**Check File Format**:
```bash
# Verify file extension
file your_document.pdf

# Check file size
ls -lh your_document.pdf
```

**Supported Formats**:
- PDF (`.pdf`) - Text extraction
- Microsoft Word (`.docx`) - Text extraction
- Maximum file size: 16MB (configurable)

**File Validation**:
```python
# Test file processing
from services.document_service import DocumentProcessingService

service = DocumentProcessingService()
print(service.allowed_extensions)  # Should show: ['pdf', 'docx']
print(service.is_allowed_file("test.pdf"))  # Should return: True
```

**Prevention**:
- Use only supported file formats
- Ensure files are not corrupted
- Check file size limits

### 4. Authentication Issues

**Problem**: Cannot access API documentation

**Symptoms**:
```
401 Unauthorized
Authentication required
```

**Solutions**:

**Check Credentials**:
```bash
# Verify in .env file
cat .env | grep DOCS_USERNAME
cat .env | grep DOCS_PASSWORD
cat .env | grep DOCS_AUTH_ENABLED
```

**Test Authentication**:
```bash
# Test with default credentials
curl -u "admin:admin123" http://localhost:5000/docs

# Test with custom credentials
curl -u "your_username:your_password" http://localhost:5000/docs
```

**Disable Authentication (Development Only)**:
```bash
# In .env file
DOCS_AUTH_ENABLED=false
```

**Prevention**:
- Use strong, unique passwords
- Change default credentials immediately
- Keep credentials secure

### 5. CORS Issues

**Problem**: Frontend cannot connect to AI service

**Symptoms**:
```
CORS error in browser console
Access to fetch at 'http://localhost:5000/evaluate' from origin 'http://localhost:3000' has been blocked
```

**Solutions**:

**Check CORS Configuration**:
```bash
# Verify in .env file
cat .env | grep CORS
```

**Update CORS Settings**:
```bash
# In .env file
CORS_ALLOW_ORIGINS=http://localhost:3000,http://localhost:4000,http://127.0.0.1:3000
CORS_ALLOW_CREDENTIALS=true
```

**Test CORS**:
```bash
# Test preflight request
curl -X OPTIONS http://localhost:5000/evaluate \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"
```

**Prevention**:
- Configure CORS for all frontend origins
- Use HTTPS in production
- Limit CORS to necessary origins

### 6. Service Startup Issues

**Problem**: Service fails to start

**Symptoms**:
```
Address already in use
Port 5000 is already in use
```

**Solutions**:

**Check Port Usage**:
```bash
# Check what's using port 5000
# Windows
netstat -ano | findstr :5000

# macOS/Linux
lsof -i :5000
```

**Kill Process**:
```bash
# Windows (replace PID with actual process ID)
taskkill /PID <PID> /F

# macOS/Linux
kill -9 <PID>
```

**Change Port**:
```bash
# In .env file
AI_PORT=5001

# Or use command line
python -m ai.main --port 5001
```

**Prevention**:
- Use unique ports for different services
- Check for conflicting services
- Use environment variables for configuration

## 🧪 Testing and Validation

### Health Check Testing

```bash
# Test service health
curl http://localhost:5000/health

# Expected response
{
  "status": "healthy",
  "service": "ATS AI Service",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### API Endpoint Testing

**Test CV Evaluation**:
```bash
curl -X POST http://localhost:5000/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "cv_text": "Experienced Python developer with 5 years of experience...",
    "job_description": "We are looking for a Python developer with FastAPI experience...",
    "filename": "test_resume.pdf"
  }'
```

**Test Document Upload**:
```bash
curl -X POST http://localhost:5000/extract-text \
  -F "file=@test_document.pdf"
```

**Test Quiz Generation**:
```bash
curl -X POST http://localhost:5000/generate-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Python developer position...",
    "num_questions": 5
  }'
```

### Authentication Testing

```bash
# Test protected endpoints
curl -u "admin:admin123" http://localhost:5000/docs
curl -u "admin:admin123" http://localhost:5000/redoc
curl -u "admin:admin123" http://localhost:5000/openapi.json

# Test without authentication (should fail)
curl http://localhost:5000/docs
```

## 🚀 Production Deployment

### Docker Deployment

**Build Image**:
```bash
cd ai
docker build -t ats-ai .
```

**Run Container**:
```bash
# Basic run
docker run -p 5000:5000 ats-ai

# With environment file
docker run --env-file .env -p 5000:5000 ats-ai

# With custom port
docker run --env-file .env -p 8080:5000 ats-ai
```

**Docker Compose**:
```yaml
version: '3.8'
services:
  ai-service:
    build: ./ai
    ports:
      - "5000:5000"
    env_file:
      - ./ai/.env
    environment:
      - AI_HOST=0.0.0.0
      - AI_PORT=5000
    restart: unless-stopped
```

### Environment-Specific Configuration

**Development**:
```bash
AI_HOST=0.0.0.0
AI_PORT=5000
DEBUG=true
LOG_LEVEL=DEBUG
DOCS_AUTH_ENABLED=false
```

**Staging**:
```bash
AI_HOST=0.0.0.0
AI_PORT=5000
DEBUG=false
LOG_LEVEL=INFO
DOCS_AUTH_ENABLED=true
```

**Production**:
```bash
AI_HOST=0.0.0.0
AI_PORT=5000
DEBUG=false
LOG_LEVEL=WARNING
DOCS_AUTH_ENABLED=true
FORCE_HTTPS=true
```

### Reverse Proxy Configuration

**Nginx Example**:
```nginx
server {
    listen 80;
    server_name ai.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Apache Example**:
```apache
<VirtualHost *:80>
    ServerName ai.yourdomain.com
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:5000/
    ProxyPassReverse / http://localhost:5000/
    
    RequestHeader set X-Forwarded-Proto "http"
    RequestHeader set X-Forwarded-Port "80"
</VirtualHost>
```

## 📊 Monitoring and Logging

### Log Configuration

**Log Levels**:
- `DEBUG`: Detailed information for debugging
- `INFO`: General information about service operation
- `WARNING`: Warning messages for potential issues
- `ERROR`: Error messages for failed operations
- `CRITICAL`: Critical errors that may cause service failure

**Log Files**:
- `ats_ai.log`: Main service log
- Console output: Real-time logging during development

### Health Monitoring

**Health Check Endpoint**:
```bash
# Monitor service health
curl http://localhost:5000/health

# Check response time
time curl http://localhost:5000/health
```

**External Monitoring**:
```bash
# Simple uptime monitoring
while true; do
  if curl -s http://localhost:5000/health > /dev/null; then
    echo "$(date): Service is healthy"
  else
    echo "$(date): Service is down!"
  fi
  sleep 30
done
```

### Performance Monitoring

**Response Time Monitoring**:
```bash
# Test endpoint performance
time curl -X POST http://localhost:5000/evaluate \
  -H "Content-Type: application/json" \
  -d '{"cv_text": "test", "job_description": "test"}'
```

**Load Testing**:
```bash
# Install Apache Bench
# Ubuntu/Debian
sudo apt-get install apache2-utils

# Test with multiple requests
ab -n 100 -c 10 http://localhost:5000/health
```

## 🔒 Security Best Practices

### Production Security

**Environment Variables**:
- Store sensitive data in environment variables
- Never commit credentials to version control
- Use different credentials for each environment

**Network Security**:
- Use HTTPS in production
- Configure firewall rules
- Limit access to necessary ports only

**Authentication**:
- Change default credentials immediately
- Use strong, unique passwords
- Regularly rotate credentials
- Monitor access logs

### Input Validation

**File Upload Security**:
- Validate file types and sizes
- Scan for malicious content
- Process files in isolated environment
- No persistent storage of uploaded files

**API Security**:
- Validate all input data
- Implement rate limiting
- Monitor for suspicious activity
- Log security events

## 📚 Troubleshooting Checklist

### Service Won't Start
- [ ] Check Python version (3.9+)
- [ ] Verify virtual environment is activated
- [ ] Check all dependencies are installed
- [ ] Verify .env file exists and is configured
- [ ] Check port availability
- [ ] Review error logs

### API Endpoints Not Working
- [ ] Verify service is running
- [ ] Check endpoint URLs
- [ ] Validate request format
- [ ] Check authentication (if required)
- [ ] Review service logs
- [ ] Test with simple requests

### AI Features Not Working
- [ ] Verify Cohere API key is valid
- [ ] Check API key permissions
- [ ] Verify API key has sufficient credits
- [ ] Check network connectivity
- [ ] Review AI service logs
- [ ] Test API key with curl

### File Processing Issues
- [ ] Verify file format is supported
- [ ] Check file size limits
- [ ] Ensure file is not corrupted
- [ ] Verify file permissions
- [ ] Check service logs
- [ ] Test with sample files

### Authentication Problems
- [ ] Verify credentials in .env file
- [ ] Check DOCS_AUTH_ENABLED setting
- [ ] Test with default credentials
- [ ] Verify middleware is loaded
- [ ] Check service logs
- [ ] Test endpoint access

## 🤝 Getting Help

### Self-Help Resources

1. **Check Logs**: Review `ats_ai.log` for error details
2. **Test Endpoints**: Use curl commands to test API
3. **Verify Configuration**: Check all environment variables
4. **Review Documentation**: Check related documentation files

### Common Solutions

- **Import Errors**: Use `python -m ai.main` from project root
- **Port Conflicts**: Change AI_PORT in .env file
- **API Key Issues**: Verify Cohere API key validity
- **File Upload**: Check file format and size
- **Authentication**: Verify credentials and settings

### When to Seek Help

- Service won't start after trying all solutions
- API endpoints return unexpected errors
- AI features consistently fail
- Performance issues in production
- Security concerns

## 📄 License

This troubleshooting guide is part of the ATS AI Service, licensed under the MIT License.
