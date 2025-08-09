# 🖥️ ATS Backend Service

A professional FastAPI-based backend for the Advanced Applicant Tracking System, providing comprehensive job management, AI-powered CV evaluation, automated quiz generation, and secure HR workflow management.

## ✨ Features

### Core Functionality

- **Job Management**: Create, update, and manage job postings with full CRUD operations
- **CV Processing**: AI-powered CV text extraction and evaluation against job requirements
- **Smart Evaluation**: Automated CV scoring and accept/reject decisions
- **Quiz System**: Dynamic AI-generated quizzes with secure access and anti-cheating measures
- **HR Review Interface**: Complete application dashboard with interview scheduling
- **Email Notifications**: Automated candidate communication throughout the process
- **AWS S3 Integration**: Direct file uploads to S3 with public URL access

### Security & Performance

- **Duplicate Prevention**: Email-based duplicate application detection
- **Quiz Security**: Email validation and single submission enforcement
- **Input Sanitization**: XSS and NoSQL injection prevention
- **Rate Limiting**: DDoS protection and request throttling
- **MongoDB Integration**: Scalable NoSQL database with Motor async driver
- **Real-time Analytics**: System statistics and performance metrics
- **Cloud Storage**: AWS S3 for scalable file storage and public access

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder:

- **[📖 Documentation Overview](./docs/README.md)** - Complete documentation index and navigation
- **[🏗️ Backend Development Overview](./docs/00-backend-development-overview.md)** - System architecture and implementation details
- **[🗄️ Database Optimization Guide](./docs/01-database-optimization-guide.md)** - Streamlined applications collection design
- **[🛡️ Security Implementation Guide](./docs/02-security-implementation-guide.md)** - Security features and protection measures
- **[🐛 Quiz Submission Bugfix](./docs/03-quiz-submission-bugfix.md)** - Variable scope resolution fixes
- **[🔒 Quiz Security Enhancement](./docs/04-quiz-security-enhancement.md)** - Preventing multiple submissions
- **[👥 HR Review System Architecture](./docs/05-hr-review-system-architecture.md)** - Complete application management
- **[💾 CV Evaluation Database Fix](./docs/06-cv-evaluation-database-fix.md)** - Resolving storage issues
- **[☁️ AWS S3 Integration Guide](./S3_SETUP.md)** - Complete S3 setup and configuration

## 🏗️ Architecture

- **FastAPI** application (Python 3.9+)
- **MongoDB** with Motor async driver
- **Pydantic** models for type safety and validation
- **AWS S3** for cloud file storage and public access
- **Modular codebase**: `src/` with `config/`, `controllers/`, `models/`, `routes/`, `services/`, `middlewares/`, `utils/`
- **AI Integration**: External AI service for CV evaluation and quiz generation
- **JWT Authentication**: Secure token-based authentication system

## 📚 API Endpoints

### Job Management

| Endpoint                   | Method | Description                |
| -------------------------- | ------ | -------------------------- |
| `/api/jobs`                | POST   | Create new job posting     |
| `/api/jobs`                | GET    | List all job postings      |
| `/api/jobs/{job_id}`       | GET    | Get job posting details    |
| `/api/jobs/{job_id}`       | PUT    | Update job posting         |
| `/api/jobs/{job_id}`       | DELETE | Delete job posting         |
| `/api/jobs/{job_id}/apply` | POST   | Submit application for job |

### Application Management

| Endpoint                                        | Method | Description             |
| ----------------------------------------------- | ------ | ----------------------- |
| `/api/applications`                             | GET    | List all applications   |
| `/api/applications/{app_id}`                    | GET    | Get application details |
| `/api/applications/{app_id}/schedule-interview` | POST   | Schedule interview      |

### File Upload (AWS S3)

| Endpoint                    | Method | Description                    |
| --------------------------- | ------ | ------------------------------ |
| `/upload`                   | POST   | Upload file to S3 bucket      |
| `/upload/status`            | GET    | Check S3 service status       |
| `/upload/{s3_key}`          | DELETE | Delete file from S3 bucket    |
| `/upload/url/{s3_key}`      | GET    | Get public URL for file       |

### Quiz System

| Endpoint                 | Method | Description            |
| ------------------------ | ------ | ---------------------- |
| `/api/quiz/{session_id}` | GET    | Get quiz questions     |
| `/api/quiz/submit`       | POST   | Submit quiz answers    |
| `/api/quiz/users`        | GET    | List quiz participants |

### System & Analytics

| Endpoint                       | Method | Description                 |
| ------------------------------ | ------ | --------------------------- |
| `/health`                      | GET    | System health check         |
| `/api/statistics/applications` | GET    | Application statistics      |
| `/api/statistics/jobs`         | GET    | Job posting statistics      |
| `/api/statistics/quiz`         | GET    | Quiz performance statistics |

Interactive API docs: [http://localhost:4000/docs](http://localhost:4000/docs)

## ⚙️ Environment Variables

Create a `.env` file in the `services/ats-system-checker/` directory with:

```bash
# Server Configuration
API_HOST=0.0.0.0
API_PORT=4000
FRONTEND_URL=http://localhost:3000

# Database Configuration
MONGODB_URL=mongodb://localhost:27017
MONGODB_DATABASE=ats_system

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-unique-bucket-name

# Email Configuration
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_gmail_app_password

# AI Service Configuration
AI_SERVICE_URL=http://localhost:5000
```

## 🚀 Quick Start

### 1. Setup AWS S3 (Required for file uploads)

1. **Create AWS Account**: Sign up at [aws.amazon.com](https://aws.amazon.com)
2. **Create S3 Bucket**: Follow the [S3 Setup Guide](./S3_SETUP.md)
3. **Configure Environment**: Update `.env` with your AWS credentials

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Test S3 Integration

```bash
python test_s3_integration.py
```

### 4. Start the Server

```bash
python -m src.main
```

### 5. Access the API

- **API Documentation**: http://localhost:4000/docs
- **Alternative Docs**: http://localhost:4000/redoc
- **Health Check**: http://localhost:4000/health

## 🔧 Testing

### Test S3 Integration
```bash
python test_s3_integration.py
```

### Test File Upload
```bash
curl -X POST http://localhost:4000/upload \
  -F "file=@test.pdf"
```

### Test Application Submission
```bash
curl -X POST http://localhost:4000/api/jobs/{job_id}/apply \
  -F "cv_file=@resume.pdf" \
  -F "candidate_email=test@example.com" \
  -F "candidate_name=Test User"
```

## 📋 Features Overview

### AWS S3 Integration
- **Direct Upload**: Files uploaded directly to S3 bucket
- **Public Access**: Files accessible via direct URLs
- **Unique Naming**: Timestamp + UUID to prevent conflicts
- **File Validation**: PDF/DOCX only, max 16MB
- **Error Handling**: Comprehensive S3 operation error handling

### Application Workflow
1. **File Upload**: CV uploaded to S3 via `/upload` endpoint
2. **URL Storage**: S3 file URL stored in database
3. **AI Processing**: File content extracted for CV evaluation
4. **Public Access**: Files accessible via direct URLs in browser
5. **Response**: Application includes S3 file URL for viewing

## 🛠️ Development

### Project Structure
```
src/
├── config/          # Settings and configuration
├── controllers/     # Business logic controllers
├── models/          # Database and API models
├── routes/          # API endpoint definitions
├── services/        # External service integrations
│   ├── s3_service.py    # AWS S3 integration
│   ├── database_service.py
│   ├── email_service.py
│   └── evaluation_service.py
├── middlewares/     # Request/response middleware
└── utils/           # Utility functions
```

### Key Files
- **S3 Integration**: `src/services/s3_service.py`
- **Upload Routes**: `src/routes/upload_routes.py`
- **Settings**: `src/config/settings.py`
- **Job Controller**: `src/controllers/job.controller.py`

## 📖 Additional Resources

- **[S3 Setup Guide](./S3_SETUP.md)** - Complete AWS S3 configuration
- **[Environment Template](./env.example)** - Sample environment variables
- **[Test Script](./test_s3_integration.py)** - S3 integration testing
- **[API Documentation](http://localhost:4000/docs)** - Interactive API docs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
