# 🖥️ ATS Backend Service

A professional Express.js/TypeScript-based backend for the Advanced Applicant Tracking System, providing comprehensive job management, AI-powered CV evaluation, automated quiz generation, and secure HR workflow management.

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
- **[☁️ AWS S3 Integration Guide](./docs/S3_SETUP.md)** - Complete S3 setup and configuration
- **[🔄 TypeScript Migration Guide](./docs/08-typescript-migration.md)** - Migration from Python to TypeScript

## 🏗️ Architecture

- **Express.js** application (Node.js 20+)
- **TypeScript** for type safety and modern JavaScript features
- **MongoDB** with Mongoose ODM
- **Zod** for runtime validation
- **AWS S3** for cloud file storage and public access
- **Modular codebase**: `src/` with `config/`, `controllers/`, `models/`, `routes/`, `services/`, `middlewares/`, `utils/`
- **AI Integration**: External AI service for CV evaluation and quiz generation
- **JWT Authentication**: Secure token-based authentication system

## 📚 API Endpoints

### Job Management

| Endpoint                           | Method | Description                |
| ---------------------------------- | ------ | -------------------------- |
| `/ats-checker/jobs`                | POST   | Create new job posting     |
| `/ats-checker/jobs`                | GET    | List all job postings      |
| `/ats-checker/jobs/{job_id}`       | GET    | Get job posting details    |
| `/ats-checker/jobs/{job_id}`       | PUT    | Update job posting         |
| `/ats-checker/jobs/{job_id}`       | DELETE | Delete job posting         |
| `/ats-checker/jobs/{job_id}/apply` | POST   | Submit application for job |

### Application Management

| Endpoint                                                | Method | Description             |
| ------------------------------------------------------- | ------ | ----------------------- |
| `/ats-checker/applications`                             | GET    | List all applications   |
| `/ats-checker/applications/{app_id}`                    | GET    | Get application details |
| `/ats-checker/applications/{app_id}/schedule-interview` | POST   | Schedule interview      |

### AWS S3 File Operations

| Endpoint                              | Method | Description                |
| ------------------------------------- | ------ | -------------------------- |
| `/ats-checker/s3/upload`              | POST   | Upload file to S3 bucket   |
| `/ats-checker/s3/status`              | GET    | Check S3 service status    |
| `/ats-checker/s3/debug`               | GET    | Debug S3 service status    |
| `/ats-checker/s3/{s3_key}`            | DELETE | Delete file from S3 bucket |
| `/ats-checker/s3/presign/{s3_key}`    | GET    | Get presigned URL for file |
| `/ats-checker/s3/file/{s3_key}`       | GET    | Stream file via backend    |

### Quiz System

| Endpoint                         | Method | Description            |
| -------------------------------- | ------ | ---------------------- |
| `/ats-checker/quiz/{session_id}` | GET    | Get quiz questions     |
| `/ats-checker/quiz/submit`       | POST   | Submit quiz answers    |
| `/ats-checker/quiz/users`        | GET    | List quiz participants |

### System & Analytics

| Endpoint                               | Method | Description                 |
| -------------------------------------- | ------ | --------------------------- |
| `/health`                              | GET    | System health check         |
| `/ats-checker/statistics/applications` | GET    | Application statistics      |
| `/ats-checker/statistics/jobs`         | GET    | Job posting statistics      |
| `/ats-checker/statistics/quiz`         | GET    | Quiz performance statistics |

Interactive API docs: [http://localhost:4002/docs](http://localhost:4002/docs)

## 🔐 API Documentation Authentication

**Important Security Notice**: The API documentation endpoints are now protected with HTTP Basic Authentication to prevent unauthorized access.

### Protected Endpoints

- `/docs` - Swagger UI documentation
- `/redoc` - ReDoc documentation
- `/openapi.json` - OpenAPI schema

### Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

### Security Configuration

To change the default credentials, set these environment variables:

```bash
# Create a .env file in the project root
DOCS_USERNAME=your_secure_username
DOCS_PASSWORD=your_secure_password
DOCS_AUTH_ENABLED=true
```

**⚠️ Security Recommendations:**

1. **Change default credentials immediately** in production
2. Use strong, unique passwords
3. Consider using environment variables for credentials
4. Regularly rotate credentials
5. Monitor access logs for suspicious activity

### Disabling Authentication

To disable authentication (not recommended for production), set:

```bash
DOCS_AUTH_ENABLED=false
```

## ⚙️ Environment Variables

Create a `.env` file in the `services/ats-system-checker/` directory with:

```bash
# Server Configuration
API_HOST=0.0.0.0
API_PORT=4002
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

# API Documentation Authentication
DOCS_USERNAME=your_secure_username
DOCS_PASSWORD=your_secure_password
DOCS_AUTH_ENABLED=true
```

## 🚀 Quick Start

### 1. Setup AWS S3 (Required for file uploads)

1. **Create AWS Account**: Sign up at [aws.amazon.com](https://aws.amazon.com)
2. **Create S3 Bucket**: Follow the [S3 Setup Guide](./S3_SETUP.md)
3. **Configure Environment**: Update `.env` with your AWS credentials

### 2. Install Dependencies

```bash
npm install
```

### 3. Test S3 Integration

The S3 integration can be tested via the API endpoints once the server is running.

### 4. Start the Server

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm run build
npm start
```

### 5. Access the API

- **Health Check**: <http://localhost:4002/ats-checker/health>
- **API Root**: <http://localhost:4002/>

**Note**: API documentation endpoints (Swagger/ReDoc) can be added if needed. The API is fully functional via REST endpoints.

## 🔧 Testing

### Test File Upload

```bash
curl -X POST http://localhost:4002/ats-checker/s3/upload \
  -F "file=@test.pdf"
```

### Test Application Submission

```bash
curl -X POST http://localhost:4002/ats-checker/jobs/{job_id}/apply \
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

```text
src/
├── config/          # Settings and configuration
│   ├── env.config.ts       # Environment configuration
│   └── database.config.ts  # Database connection
├── controllers/     # Business logic controllers
│   ├── job.controller.ts
│   ├── application.controller.ts
│   ├── quiz.controller.ts
│   ├── statistics.controller.ts
│   ├── health.controller.ts
│   └── aws_s3.controller.ts
├── models/          # Database and API models
│   ├── database.models.ts  # Mongoose schemas
│   ├── api.models.ts       # API interfaces
│   └── evaluation.models.ts
├── routes/          # API endpoint definitions
│   ├── jobs.routes.ts
│   ├── applications.routes.ts
│   ├── quiz.routes.ts
│   ├── statistics.routes.ts
│   ├── aws_s3.routes.ts
│   └── health.routes.ts
├── services/        # External service integrations
│   ├── s3.service.ts           # AWS S3 integration
│   ├── database.service.ts
│   ├── email.service.ts
│   ├── evaluation.service.ts
│   └── template.service.ts
├── middlewares/     # Request/response middleware
│   ├── errorHandler.middleware.ts
│   ├── logging.middleware.ts
│   └── security.middleware.ts
└── utils/           # Utility functions
    ├── jwt_utils.ts
    ├── gateway_client.ts
    ├── responses.ts
    └── dependencies.ts
```

### Key Files

- **S3 Integration**: `src/services/s3.service.ts`
- **AWS S3 Routes**: `src/routes/aws_s3.routes.ts`
- **Environment Config**: `src/config/env.config.ts`
- **Job Controller**: `src/controllers/job.controller.ts`
- **Main Application**: `src/index.ts`

## 📖 Additional Resources

- **[S3 Setup Guide](./docs/S3_SETUP.md)** - Complete AWS S3 configuration (see [`docs/`](./docs/))
- **Environment variables** - Use the template in the [Environment Variables](#️-environment-variables) section above; copy to `.env` in this directory (`.env` and `.env.production` are gitignored).
- **[API Documentation](http://localhost:4002/docs)** - Interactive API docs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
