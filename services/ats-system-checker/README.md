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

### Security & Performance

- **Duplicate Prevention**: Email-based duplicate application detection
- **Quiz Security**: Email validation and single submission enforcement
- **Input Sanitization**: XSS and NoSQL injection prevention
- **Rate Limiting**: DDoS protection and request throttling
- **MongoDB Integration**: Scalable NoSQL database with Motor async driver
- **Real-time Analytics**: System statistics and performance metrics

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

## 🏗️ Architecture

- **FastAPI** application (Python 3.9+)
- **MongoDB** with Motor async driver
- **Pydantic** models for type safety and validation
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

# AI Service Configuration
AI_SERVICE_URL=http://localhost:5000

# Email Configuration
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_gmail_app_password

# Security
SECRET_KEY=your-super-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key

# Optional: Cohere API (if using Cohere directly)
COHERE_API_KEY=your_cohere_api_key_here
```

## 🚀 Quick Start

### 1. Install dependencies

```bash
cd services/ats-system-checker
pip install -r requirements.txt
```

### 2. Set up environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your configuration
nano .env
```

### 3. Run the backend service

#### **Development (Recommended)**

From the `services/ats-system-checker` directory:

```bash
# Run as module (robust for imports)
python -m src.main

# Or with hot reload
uvicorn src.main:app --reload --host 0.0.0.0 --port 4000 --reload-exclude venv --reload-exclude .pytest_cache --reload-exclude __pycache__ --reload-exclude uploads --reload-exclude ats_system.log
```

#### **Production (Docker)**

```bash
# Build the image
docker build -t ats-backend .

# Run the container
docker run --env-file .env -p 4000:4000 ats-backend
```

Service will be available at [http://localhost:4000](http://localhost:4000)

## 🧪 Development & Testing

### Development Commands

```bash
# Run with auto-reload
uvicorn src.main:app --reload --host 0.0.0.0 --port 4000

# Run tests
pytest

# Run tests with coverage
pytest --cov=src

# Code linting
flake8 .

# Code formatting
black .
```

### Testing Strategy

- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Security Tests**: Authentication and authorization
- **Database Tests**: MongoDB operation testing

## 🐞 Troubleshooting

### Common Issues

- **Import/module errors:** Always run from the `services/ats-system-checker` directory using `python -m src.main` or `uvicorn src.main:app ...`
- **Watcher spam ("change detected"):** The backend uses `reload_excludes` to ignore changes in `venv`, `.pytest_cache`, `__pycache__`, `uploads`, and `ats_system.log`
- **.env file:** Must be present in the `services/ats-system-checker/` directory before running or building Docker image
- **Database connection:** Ensure MongoDB is running and accessible at the configured URL
- **AI service:** Verify the AI service is running and accessible at the configured URL

### Debug Mode

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
python -m src.main
```

## 🐳 Docker Deployment

### 1. Create the .env file

Place your backend environment variables in `services/ats-system-checker/.env`

### 2. Build and run

```bash
# Build the image
docker build -t ats-backend .

# Run the container
docker run --env-file .env -p 4000:4000 ats-backend
```

### 3. Docker Compose (Alternative)

```bash
# Using docker-compose.yml
docker-compose up -d
```

## 📊 System Monitoring

### Health Checks

- Database connectivity: `/health`
- AI service availability: Automatic monitoring
- Email service status: Automatic monitoring
- System resource usage: Built-in metrics

### Logging

- Structured JSON logging
- Request/response logging
- Error tracking and alerting
- Performance metrics collection

## 🔧 Configuration

### Database Collections

- `job_postings` - Job advertisements
- `applications` - Candidate applications
- `cv_evaluations` - CV evaluation results
- `quiz_sessions` - Generated quiz sessions
- `quiz_results` - Quiz submission results
- `email_notifications` - Email tracking
- `users` - System users (HR)

### Security Features

- JWT token-based authentication
- Role-based access control
- Input validation and sanitization
- Rate limiting and DDoS protection
- Secure file upload handling

## 🤝 Contributing

### Development Guidelines

- Follow PEP 8 coding standards
- Use type hints for all functions
- Write comprehensive docstrings
- Maintain consistent naming conventions

### Git Workflow

- Create feature branches
- Write descriptive commit messages
- Submit pull requests for review
- Ensure all tests pass

## 📞 Support

### Documentation

- Check the [`docs/`](./docs/) folder for comprehensive documentation
- API documentation available at `/docs` when server is running
- Troubleshooting guides in individual documentation files

### Bug Reporting

- Use structured bug report template
- Include reproduction steps
- Provide environment information
- Classify priority level

## 📝 License

MIT License

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: Development Team
