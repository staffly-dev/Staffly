# ATS System Checker - API Endpoints Documentation

## Overview
This document provides a comprehensive list of all available API endpoints in the ATS System Checker service running on `http://localhost:4002`.

## Base URL
```
http://localhost:4002
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Available Endpoints

### 1. Root Endpoint
- **GET** `/` - Service information and available endpoints

### 2. Health Check Endpoints
- **GET** `/ats-checker/health` - Detailed health check with system status
- **GET** `/ats-checker/health/simple` - Simple health check

### 3. Jobs Management Endpoints
- **GET** `/ats-checker/jobs` - Get all job postings (requires authentication)
- **POST** `/ats-checker/jobs` - Create a new job posting (requires authentication)
- **GET** `/ats-checker/jobs/:job_id` - Get specific job posting by ID
- **PUT** `/ats-checker/jobs/:job_id` - Update job posting by ID
- **DELETE** `/ats-checker/jobs/:job_id` - Delete job posting by ID
- **POST** `/ats-checker/jobs/:job_id/apply` - Apply for a job with CV upload

### 4. Quiz Endpoints
- **POST** `/ats-checker/quiz/submit` - Submit quiz answers for evaluation
- **POST** `/ats-checker/quiz/users` - Get all quiz users (requires authentication)
- **GET** `/ats-checker/quiz/:session_id` - Get quiz by session ID

### 5. Statistics Endpoints
- **GET** `/ats-checker/statistics` - Get general system statistics
- **GET** `/ats-checker/user-statistics` - Get user-specific statistics (requires authentication)

### 6. Applications Endpoints
- **POST** `/ats-checker/applications` - Get all applications (requires authentication)
- **GET** `/ats-checker/applications/:app_id` - Get specific application by ID

### 7. AWS S3 Endpoints
- **POST** `/ats-checker/s3/upload` - Upload file to S3
- **GET** `/ats-checker/s3/status` - Check S3 service status
- **GET** `/ats-checker/s3/debug` - Debug S3 configuration
- **DELETE** `/ats-checker/s3/:s3_key(*)` - Delete file from S3
- **GET** `/ats-checker/s3/presign/:s3_key(*)` - Get presigned URL for S3 file
- **GET** `/ats-checker/s3/file/:s3_key(*)` - Download file from S3

### 8. Documentation Endpoints
- **GET** `/docs` - Swagger API documentation (may require authentication)
- **GET** `/openapi.json` - OpenAPI specification in JSON format

### 9. Static File Endpoints
- **GET** `/uploads/*` - Serve uploaded files
- **GET** `/evaluations/*` - Serve evaluation files

## Request Headers

### Required for Authenticated Endpoints
- `Authorization: Bearer <jwt-token>` - JWT authentication token
- `X-User-Id: <user-id>` - User ID (24-character hex string)
- `X-Created-By: <user-id>` - Creator user ID (optional, must match X-User-Id if provided)

### Content Types
- `application/json` - For JSON request bodies
- `multipart/form-data` - For file uploads

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": true,
  "message": "Error description",
  "details": { ... }
}
```

## HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## File Upload Constraints
- **Allowed formats**: PDF, DOCX
- **Maximum file size**: Defined by `MAX_FILE_SIZE` environment variable
- **Upload endpoint**: `/ats-checker/s3/upload` or `/ats-checker/jobs/:job_id/apply`

## Rate Limiting
Rate limiting may be implemented based on environment configuration.

## Environment Variables
Key environment variables that affect endpoint behavior:
- `PORT` - Server port (default: 4002)
- `DOCS_AUTH_ENABLED` - Enable authentication for docs endpoint
- `CORS_ALLOW_ORIGINS` - Allowed CORS origins
- `MAX_FILE_SIZE` - Maximum file upload size

## Error Handling
All endpoints include comprehensive error handling with descriptive error messages and appropriate HTTP status codes.

## Testing
Use the Swagger documentation at `/docs` for interactive API testing and exploration.

---
*Last updated: February 2026*
*Service version: 2.0.0*
