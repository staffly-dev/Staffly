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

### 9. [TypeScript Migration Guide](08-typescript-migration.md)

**Migration from Python to TypeScript**

- Technology stack changes
- Architecture preservation
- Code examples and patterns
- Migration benefits and troubleshooting

### 10. [Quick Start Guide - TypeScript](QUICK_START_TYPESCRIPT.md)

**Getting started with the TypeScript version**

- Installation steps
- Development workflow
- Common commands
- Troubleshooting guide

### 10. [Complete System Security](08-complete-system-security.md)

**Comprehensive security across all services**

- ATS System and AI Service protection
- Unified authentication implementation
- Security testing and monitoring
- Production deployment guidelines

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (LTS recommended)
- MongoDB 4.4+
- npm or yarn
- Docker (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd ats-system-checker

# Install dependencies
npm install

# Set up environment variables
cp .example.env .env
# Edit .env with your configuration

# Run the application (development)
npm run dev

# Or build and run (production)
npm run build
npm start
```

### API Documentation

The API is accessible via REST endpoints. All endpoints are documented in the main README.

- **Health Check**: http://localhost:4002/ats-checker/health
- **API Root**: http://localhost:4002/

**Note**: The service has been converted from Python/FastAPI to TypeScript/Express.js. All functionality is preserved with improved type safety.

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
# Run all tests (when test suite is set up)
npm test

# Run with coverage
npm run test:coverage
```

### Test Coverage

- Unit tests for all services (to be implemented)
- Integration tests for API endpoints (to be implemented)
- Database operation tests (to be implemented)
- Security feature tests (to be implemented)

## 🚀 Deployment

### Docker Deployment

```bash
# Build the image
docker build -t ats-system-checker .

# Run the container
docker run -p 4002:4002 ats-system-checker
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
