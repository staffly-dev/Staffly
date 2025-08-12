# 📚 AI Service API Endpoints Reference

## Overview

This document provides comprehensive documentation for all API endpoints in the ATS AI Service. The service provides AI-powered CV evaluation, document text extraction, and dynamic quiz generation capabilities.

## 🔗 Base URL

```
http://localhost:5000
```

## 🔐 Authentication

**Important**: API documentation endpoints (`/docs`, `/redoc`, `/openapi.json`) require HTTP Basic Authentication. See [API Documentation Security](01-api-documentation-security.md) for details.

**Default Credentials**: `admin:admin123`

## 📋 API Endpoints Summary

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/` | GET | Service information | ❌ |
| `/health` | GET | Health check | ❌ |
| `/evaluate` | POST | CV evaluation | ❌ |
| `/extract-text` | POST | Document text extraction | ❌ |
| `/generate-quiz` | POST | Quiz generation | ❌ |
| `/evaluate-quiz` | POST | Quiz evaluation | ❌ |

## 🏥 Health & Status Endpoints

### 1. Health Check

**Endpoint**: `GET /health`

**Description**: Check the health status of the AI service

**Authentication**: Not required

**Response**:
```json
{
  "status": "healthy",
  "service": "ATS AI Service",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Status Codes**:
- `200 OK`: Service is healthy
- `500 Internal Server Error`: Service is unhealthy

**Example Request**:
```bash
curl http://localhost:5000/health
```

### 2. Service Information

**Endpoint**: `GET /`

**Description**: Get basic service information and documentation links

**Authentication**: Not required

**Response**:
```json
{
  "service": "ATS AI Service",
  "version": "1.0.0",
  "status": "operational",
  "docs": "Available at /docs (authentication required)",
  "redoc": "Available at /redoc (authentication required)",
  "openapi": "Available at /openapi.json (authentication required)",
  "note": "API documentation requires authentication. Contact your administrator for credentials."
}
```

**Status Codes**:
- `200 OK`: Service information retrieved

**Example Request**:
```bash
curl http://localhost:5000/
```

## 📄 Document Processing Endpoints

### 3. Extract Text from Document

**Endpoint**: `POST /extract-text`

**Description**: Extract text content from uploaded documents (PDF or DOCX)

**Authentication**: Not required

**Request Body**: `multipart/form-data`
- `file`: Document file (PDF or DOCX)

**Supported File Types**:
- PDF (`.pdf`)
- Microsoft Word (`.docx`)

**Response**:
```json
{
  "text_content": "Extracted text from the document...",
  "email": "candidate@example.com",
  "name": "John Doe",
  "file_info": {
    "filename": "resume.pdf",
    "size_bytes": 245760,
    "size_mb": 0.23,
    "extension": "pdf",
    "is_allowed": true,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

**Status Codes**:
- `200 OK`: Text extracted successfully
- `400 Bad Request`: Unsupported file type
- `422 Unprocessable Entity`: Failed to extract text
- `500 Internal Server Error`: Service error

**Example Request**:
```bash
curl -X POST http://localhost:5000/extract-text \
  -F "file=@resume.pdf"
```

**Error Responses**:
```json
{
  "detail": "Unsupported file type. Allowed: pdf,docx"
}
```

## 🤖 AI-Powered CV Evaluation

### 4. Evaluate CV

**Endpoint**: `POST /evaluate`

**Description**: Evaluate a CV against job requirements using AI

**Authentication**: Not required

**Request Body**:
```json
{
  "cv_text": "CV content as text...",
  "job_description": "Job requirements and description...",
  "filename": "resume.pdf"
}
```

**Request Fields**:
- `cv_text` (string, required): CV content as plain text
- `job_description` (string, required): Job requirements and description
- `filename` (string, optional): Original filename for logging

**Response**:
```json
{
  "decision": "ACCEPT",
  "score": 85,
  "reasoning": "Detailed evaluation reasoning...",
  "extracted_skills": ["Python", "FastAPI", "MongoDB"],
  "experience_years": 5,
  "match_percentage": 85.5,
  "strengths": ["Strong technical skills", "Relevant experience"],
  "weaknesses": ["Could improve communication skills"],
  "recommendations": "Strong candidate, recommend for interview"
}
```

**Response Fields**:
- `decision`: Evaluation decision (`ACCEPT`, `REJECT`, `REVIEW`)
- `score`: Numerical score (0-100)
- `reasoning`: Detailed reasoning for the decision
- `extracted_skills`: List of skills found in CV
- `experience_years`: Years of experience extracted
- `match_percentage`: Match percentage with job requirements
- `strengths`: List of candidate strengths
- `weaknesses`: Areas for improvement
- `recommendations`: Hiring recommendations

**Status Codes**:
- `200 OK`: Evaluation completed successfully
- `500 Internal Server Error`: AI service error

**Example Request**:
```bash
curl -X POST http://localhost:5000/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "cv_text": "Experienced Python developer with 5 years...",
    "job_description": "We are looking for a Python developer...",
    "filename": "resume.pdf"
  }'
```

## 🧠 Quiz System Endpoints

### 5. Generate Quiz

**Endpoint**: `POST /generate-quiz`

**Description**: Generate a quiz based on job description using AI

**Authentication**: Not required

**Request Body**:
```json
{
  "job_description": "Job requirements and description...",
  "num_questions": 10
}
```

**Request Fields**:
- `job_description` (string, required): Job requirements and description
- `num_questions` (integer, optional): Number of questions (1-20, default: 10)

**Response**:
```json
{
  "questions": [
    {
      "question": "What is the primary purpose of FastAPI?",
      "options": [
        "Web scraping",
        "Building APIs",
        "Database management",
        "File processing"
      ],
      "correct_answer": 1,
      "explanation": "FastAPI is a modern web framework for building APIs with Python"
    }
  ],
  "total_questions": 10,
  "time_limit": 300,
  "pass_threshold": 7
}
```

**Response Fields**:
- `questions`: Array of quiz questions
- `total_questions`: Total number of questions
- `time_limit`: Time limit in seconds (300 = 5 minutes)
- `pass_threshold`: Minimum score to pass (7 out of 10)

**Question Structure**:
- `question`: The question text
- `options`: Array of answer options
- `correct_answer`: Index of correct answer (0-based)
- `explanation`: Explanation of the correct answer

**Status Codes**:
- `200 OK`: Quiz generated successfully
- `500 Internal Server Error`: AI service error

**Example Request**:
```bash
curl -X POST http://localhost:5000/generate-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "We are looking for a Python developer...",
    "num_questions": 15
  }'
```

### 6. Evaluate Quiz Answers

**Endpoint**: `POST /evaluate-quiz`

**Description**: Evaluate quiz answers and return score

**Authentication**: Not required

**Request Body**:
```json
{
  "answers": [1, 0, 2, 1, 0, 1, 2, 0, 1, 0],
  "quiz_questions": [
    {
      "question": "What is the primary purpose of FastAPI?",
      "options": ["Web scraping", "Building APIs", "Database management", "File processing"],
      "correct_answer": 1,
      "explanation": "FastAPI is a modern web framework for building APIs with Python"
    }
  ]
}
```

**Request Fields**:
- `answers` (array of integers, required): Selected answer indices (0-based)
- `quiz_questions` (array of objects, required): Original quiz questions

**Response**:
```json
{
  "score": 8,
  "total_questions": 10,
  "percentage": 80.0,
  "passed": true,
  "pass_threshold": 7
}
```

**Response Fields**:
- `score`: Number of correct answers
- `total_questions`: Total number of questions
- `percentage`: Percentage score
- `passed`: Whether the candidate passed (score >= 7)
- `pass_threshold`: Minimum score to pass

**Status Codes**:
- `200 OK`: Quiz evaluated successfully
- `500 Internal Server Error`: Service error

**Example Request**:
```bash
curl -X POST http://localhost:5000/evaluate-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [1, 0, 2, 1, 0, 1, 2, 0, 1, 0],
    "quiz_questions": [...]
  }'
```

## 📊 Data Models

### EvaluationResult

```json
{
  "decision": "ACCEPT",
  "score": 85,
  "reasoning": "Detailed evaluation reasoning...",
  "extracted_skills": ["Python", "FastAPI", "MongoDB"],
  "experience_years": 5,
  "match_percentage": 85.5,
  "strengths": ["Strong technical skills", "Relevant experience"],
  "weaknesses": ["Could improve communication skills"],
  "recommendations": "Strong candidate, recommend for interview"
}
```

### FileUploadInfo

```json
{
  "filename": "resume.pdf",
  "size_bytes": 245760,
  "size_mb": 0.23,
  "extension": "pdf",
  "is_allowed": true,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### ErrorResponse

```json
{
  "error": "Internal server error",
  "detail": "Detailed error information",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🚨 Error Handling

### HTTP Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request data
- `422 Unprocessable Entity`: Request validation failed
- `500 Internal Server Error`: Server error

### Error Response Format

All errors return a consistent format:

```json
{
  "error": "Error message",
  "detail": "Detailed error information",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Common Error Scenarios

1. **File Type Not Supported**
   ```json
   {
     "detail": "Unsupported file type. Allowed: pdf,docx"
   }
   ```

2. **Text Extraction Failed**
   ```json
   {
     "detail": "Failed to extract text from document"
   }
   ```

3. **AI Service Not Initialized**
   ```json
   {
     "detail": "AI service not initialized"
   }
   ```

4. **Quiz Generation Failed**
   ```json
   {
     "detail": "Failed to generate quiz questions"
   }
   ```

## 🔧 Rate Limiting & Performance

### File Size Limits

- **Maximum file size**: 16MB (configurable)
- **Supported formats**: PDF, DOCX
- **Processing time**: Varies by file size and content

### AI Service Performance

- **CV Evaluation**: 5-15 seconds depending on content length
- **Quiz Generation**: 10-30 seconds depending on question count
- **Text Extraction**: 1-5 seconds depending on file size

## 🧪 Testing Examples

### Test CV Evaluation

```bash
curl -X POST http://localhost:5000/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "cv_text": "Experienced Python developer with 5 years of experience in web development. Proficient in FastAPI, Django, and MongoDB. Strong problem-solving skills and experience with AWS deployment.",
    "job_description": "We are looking for a Python developer with experience in FastAPI and MongoDB. The ideal candidate should have at least 3 years of experience and be comfortable with cloud deployment.",
    "filename": "test_resume.pdf"
  }'
```

### Test Document Upload

```bash
# Create a test PDF file first
curl -X POST http://localhost:5000/extract-text \
  -F "file=@test_document.pdf"
```

### Test Quiz Generation

```bash
curl -X POST http://localhost:5000/generate-quiz \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Python developer position requiring FastAPI, MongoDB, and AWS experience. Looking for candidates with strong problem-solving skills and 3+ years of experience.",
    "num_questions": 5
  }'
```

## 🔒 Security Considerations

### Input Validation

- All input is validated using Pydantic models
- File types are strictly checked
- Request sizes are limited to prevent abuse

### Error Information

- Error messages don't expose internal system details
- Sensitive information is not logged
- All errors are logged for monitoring

### File Processing

- Files are processed in memory (not saved to disk)
- No persistent storage of uploaded files
- File content is validated before processing

## 📚 Related Documentation

- **[API Documentation Security](01-api-documentation-security.md)** - Security implementation details
- **[Environment Configuration](../README.md#environment-variables)** - Service configuration
- **[Docker Deployment](../README.md#docker-instructions)** - Container deployment
- **[Troubleshooting](../README.md#troubleshooting)** - Common issues and solutions

## 🤝 Support

For technical support or questions about the API:

1. Check the [troubleshooting guide](../README.md#troubleshooting)
2. Review the [API documentation security guide](01-api-documentation-security.md)
3. Check service logs for detailed error information
4. Ensure all required environment variables are configured

## 📄 License

This API is part of the ATS AI Service, licensed under the MIT License.
