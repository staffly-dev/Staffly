# ATS System Documentation

Welcome to the comprehensive documentation for the ATS (Applicant Tracking System) backend. This documentation covers all aspects of the system implementation, from database design to security features.

## 📚 Documentation Structure

### 1. [Backend Development Overview](00-backend-development-overview.md)

**Complete system overview and architecture**

- Technology stack and dependencies
- System architecture and design patterns
- Core features and capabilities
- API endpoints and data models
- Security implementation and performance optimizations

### 2. [Database Optimization Guide](01-database-optimization-guide.md)

**Streamlined applications collection design**

- Database structure and field descriptions
- Removed fields and optimization rationale
- API compatibility and migration status
- Database queries and application status values

### 3. [Security Implementation Guide](02-security-implementation-guide.md)

**Comprehensive security features**

- Duplicate CV upload prevention
- Quiz email validation
- Security workflow and API changes
- Error messages and testing results

### 4. [Quiz Submission Bugfix](03-quiz-submission-bugfix.md)

**Variable scope resolution fix**

- Issue description and root cause analysis
- Applied fixes and test results
- Benefits and verification steps

### 5. [Quiz Security Enhancement](04-quiz-security-enhancement.md)

**Preventing multiple submissions**

- Security issues identified and resolved
- Quiz session status management
- API changes and security improvements
- Testing procedures and benefits

### 6. [HR Review System Architecture](05-hr-review-system-architecture.md)

**Complete application management**

- Database structure and API endpoints
- Frontend integration examples
- Workflow integration and security features
- Testing results and next steps

### 7. [CV Evaluation Database Fix](06-cv-evaluation-database-fix.md)

**Resolving storage issues**

- Issue description and root cause analysis
- Applied fixes and workflow verification
- Database collections and verification steps
- Benefits and performance impact

### 8. [API Documentation Security](07-api-documentation-security.md)

**Protecting API documentation endpoints**

- HTTP Basic Authentication implementation
- Middleware configuration and security flow
- Credential management and best practices
- Monitoring, logging, and troubleshooting

### 9. [Complete System Security](08-complete-system-security.md)

**Comprehensive security across all services**

- ATS System and AI Service protection
- Unified authentication implementation
- Security testing and monitoring
- Production deployment guidelines

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- MongoDB 4.4+
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ats-system-checker

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run the application
python -m src.main
```

### API Documentation

Once the server is running, visit:

- **Swagger UI**: http://localhost:4002/docs (Authentication Required)
- **ReDoc**: http://localhost:4002/redoc (Authentication Required)

**Note**: API documentation requires authentication. Default credentials are `admin:admin123`. See [API Documentation Security](07-api-documentation-security.md) for details.

## 🔧 Development

### Project Structure

```
src/
├── controllers/          # API endpoint handlers
├── services/            # Business logic layer
├── models/              # Data models and schemas
├── routes/              # API route definitions
├── middlewares/         # Request/response middleware
├── utils/               # Utility functions
└── config/              # Configuration management
```

### Key Features

- **Job Management**: CRUD operations for job postings
- **CV Processing**: AI-powered CV evaluation
- **Quiz System**: Dynamic quiz generation and scoring
- **HR Interface**: Complete application review system
- **Security**: Comprehensive security features

## 🛡️ Security Features

- **Duplicate Prevention**: Email-based duplicate application detection
- **Quiz Security**: Email validation for quiz access
- **Input Sanitization**: XSS and NoSQL injection prevention
- **Rate Limiting**: DDoS protection and rate limiting
- **Authentication**: JWT-based authentication system
- **API Docs Protection**: HTTP Basic Authentication for documentation endpoints

## 📊 Database Collections

- `job_postings` - Job advertisements
- `applications` - Candidate applications
- `cv_evaluations` - CV evaluation results
- `quiz_sessions` - Generated quiz sessions
- `quiz_results` - Quiz submission results
- `email_notifications` - Email tracking
- `users` - System users (HR)

## 🔍 Testing

### Run Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_evaluation_service.py

# Run with coverage
pytest --cov=src
```

### Test Coverage

- Unit tests for all services
- Integration tests for API endpoints
- Database operation tests
- Security feature tests

## 🚀 Deployment

### Docker Deployment

```bash
# Build the image
docker build -t ats-system .

# Run the container
docker run -p 4000:4000 ats-system
```

### Environment Variables

```bash
# Database
MONGODB_URL=mongodb://localhost:27017/ats_system

# AI Service
AI_SERVICE_URL=http://localhost:5000

# JWT Secret
JWT_SECRET_KEY=your-secret-key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# API Documentation Authentication
DOCS_USERNAME=your_secure_username
DOCS_PASSWORD=your_secure_password
DOCS_AUTH_ENABLED=true
```
