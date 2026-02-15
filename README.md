# 🏢 Staffly - Comprehensive HR Management Platform

**Live Demo**: [Staffly HR](https://stafflyhr.tech)

Staffly is a modern, full-stack HR management platform that combines traditional HR operations with AI-powered recruitment tools. Built with microservices architecture, it provides a complete solution for employee management, applicant tracking, and business intelligence.

## 🚀 Features

### 🎯 Core HR Management

- **Employee Profiles**: Centralized employee records with comprehensive information management
- **Department Management**: Hierarchical organization with role-based permissions
- **Onboarding/Offboarding**: Streamlined processes with automated workflows and compliance tracking
- **Payroll Management**: Complete payroll processing and management
- **Performance Tracking**: Employee performance history and analytics
- **Document Management**: Secure document storage and management

### 🤖 AI-Powered Recruitment (ATS)

- **Smart CV Evaluation**: AI-powered CV analysis and scoring against job requirements
- **Automated Quiz Generation**: Dynamic skill assessments created from job descriptions
- **Intelligent Matching**: Automated candidate-job matching with scoring algorithms
- **Interview Scheduling**: Integrated calendar system for interview management
- **Email Automation**: Automated candidate communication throughout the hiring process

### 📊 Business Intelligence

- **Analytics Dashboard**: Real-time insights into HR metrics and KPIs
- **Reporting Tools**: Comprehensive reports for management and compliance
- **Performance Analytics**: Employee and department performance tracking
- **Recruitment Metrics**: Hiring funnel analysis and time-to-hire statistics

## 🏗️ Architecture

Staffly follows a microservices architecture with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Services      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (Microservices)│
│   Port: 3000    │    │   Port: 4001    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (MongoDB)     │
                       │   Port: 27017   │
                       └─────────────────┘
```

### 🎨 Frontend (`app/client/`)

- **Framework**: Next.js 15 with React 19
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Authentication**: JWT-based authentication
- **Features**: Responsive design, dark mode, real-time updates

### 🌐 API Gateway (`services/Api-Gateway/`)

- **Runtime**: Node.js with Bun
- **Purpose**: Central routing and authentication
- **Features**: Request routing, rate limiting, CORS handling
- **Port**: 4001

### 🖥️ ATS Backend (`services/ats-system-checker/`)

- **Framework**: FastAPI (Python 3.9+)
- **Database**: MongoDB with Motor async driver
- **Features**: Job management, CV processing, quiz system, HR workflows
- **Port**: 4002
- **AI Integration**: External AI service for CV evaluation

### 🤖 AI Service (`ai/`)

- **Framework**: FastAPI (Python 3.8+)
- **AI Provider**: Cohere AI integration
- **Features**: CV evaluation, quiz generation, document processing
- **Port**: 5000
- **Documentation**: Protected with HTTP Basic Auth

### 👥 HRMS Service (`services/hrms/`)

- **Runtime**: Node.js with Bun
- **Purpose**: Core HR management operations
- **Features**: Employee management, payroll, performance tracking
- **Port**: 4003

## 🛠️ Technology Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **TanStack Query** - Server state management
- **Axios** - HTTP client

### Backend Services

- **FastAPI** - Modern Python web framework
- **Node.js + Bun** - JavaScript runtime and package manager
- **MongoDB** - NoSQL database with Motor async driver
- **JWT** - JSON Web Token authentication
- **AWS S3** - Cloud file storage
- **Cohere AI** - Natural language processing

### DevOps & Infrastructure

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **MongoDB** - Primary database
- **AWS S3** - File storage and CDN

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose**
- **Node.js 18+** (for local development)
- **Python 3.9+** (for AI services)
- **MongoDB** (or use Docker)
- **AWS Account** (for S3 file storage)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/staffly.git
cd staffly
```

### 2. Environment Setup

#### Frontend Configuration

```bash
cd app/client
cp .env.example .env.local
# Edit .env.local with your configuration
```

#### Backend Services Configuration

```bash
# ATS Backend
cd services/ats-system-checker
cp .env.example .env
# Edit .env with MongoDB, AWS S3, and AI service URLs

# AI Service
cd ../../ai
cp .env.example .env
# Edit .env with Cohere AI API key

# API Gateway
cd ../services/Api-Gateway
cp .env.example .env
# Edit .env with service URLs and JWT secrets
```

### 3. Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 4. Local Development Setup

#### Frontend

```bash
cd app/client
npm install
npm run dev
# Access at http://localhost:3000
```

#### Backend Services

```bash
# ATS Backend
cd services/ats-system-checker
pip install -r requirements.txt
python -m src.main
# Access at http://localhost:4002

# AI Service
cd ../../ai
pip install -r requirements.txt
python main.py
# Access at http://localhost:5000

# API Gateway
cd ../services/Api-Gateway
bun install
bun run index.ts
# Access at http://localhost:4001
```

## 📚 API Documentation

### ATS Backend API

- **Swagger UI**: [http://localhost:4002/docs](http://localhost:4002/docs)
- **ReDoc**: [http://localhost:4002/redoc](http://localhost:4002/redoc)
- **Authentication**: `admin:admin123` (change in production!)

### AI Service API

- **Swagger UI**: [http://localhost:5000/docs](http://localhost:5000/docs)
- **ReDoc**: [http://localhost:5000/redoc](http://localhost:5000/redoc)
- **Authentication**: `admin:admin123` (change in production!)

### Key Endpoints

#### Job Management

```
POST   /ats-checker/jobs              # Create job posting
GET    /ats-checker/jobs              # List job postings
GET    /ats-checker/jobs/{id}         # Get job details
PUT    /ats-checker/jobs/{id}         # Update job posting
DELETE /ats-checker/jobs/{id}         # Delete job posting
POST   /ats-checker/jobs/{id}/apply   # Submit application
```

#### AI Services

```
POST   /evaluate                      # Evaluate CV against job
POST   /extract-text                  # Extract text from documents
POST   /generate-quiz                 # Generate quiz from job description
POST   /evaluate-quiz                 # Evaluate quiz answers
```

## 🔧 Development

### Project Structure

```
staffly/
├── app/
│   └── client/                 # Next.js frontend
├── services/
│   ├── Api-Gateway/           # Central API gateway
│   ├── ats-system-checker/    # ATS backend service
│   └── hrms/                  # HR management service
├── ai/                        # AI microservice
├── docker-compose.yml         # Container orchestration
└── README.md                  # This file
```

### Code Quality

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Black** for Python code formatting
- **Pytest** for Python testing

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🔐 Security

### Authentication

- **JWT tokens** for API authentication
- **HTTP Basic Auth** for API documentation
- **Role-based access control** (RBAC)
- **Input sanitization** and validation

### Data Protection

- **XSS prevention** with input sanitization
- **NoSQL injection protection**
- **Rate limiting** for DDoS protection
- **Secure file uploads** with validation
- **Environment variable** configuration

## 📊 Monitoring & Analytics

### Health Checks

- **System Health**: `/health` endpoints for all services
- **Database Status**: MongoDB connection monitoring
- **S3 Integration**: AWS S3 service status checks
- **AI Service**: External AI service availability

### Analytics

- **Application Statistics**: Real-time application metrics
- **Job Performance**: Job posting and application analytics
- **Quiz Analytics**: Quiz completion and performance data
- **System Performance**: Service response times and errors

## 🚀 Deployment

### Production Environment

1. **Configure Environment Variables** for all services
2. **Set up AWS S3** bucket for file storage
3. **Configure MongoDB** with proper authentication
4. **Update API Documentation** credentials
5. **Set up SSL/TLS** certificates
6. **Configure Reverse Proxy** (Nginx/Apache)

### Docker Deployment

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose up -d --scale ats-backend=3
```

## 📖 Documentation

### Service-Specific Documentation

- **[ATS Backend Docs](./services/ats-system-checker/docs/)** - Complete ATS system documentation
- **[AI Service Docs](./ai/docs/)** - AI service API and configuration
- **[Frontend Docs](./app/client/README.md)** - Client-side development guide

### Key Documentation Files

- **[Backend Development Overview](./services/ats-system-checker/docs/00-backend-development-overview.md)**
- **[Security Implementation Guide](./services/ats-system-checker/docs/02-security-implementation-guide.md)**

## 🤝 Support

### Getting Help

- **Documentation**: Check the comprehensive docs in each service
- **Issues**: Open an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

### Community

- **Contributors**: We welcome contributions from the community
- **Code of Conduct**: Please read our code of conduct
- **License**: MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Cohere AI** for natural language processing capabilities
- **FastAPI** for the excellent Python web framework
- **Next.js** for the powerful React framework
- **MongoDB** for the flexible NoSQL database
- **AWS** for cloud infrastructure services

---

**Staffly** - Streamlining HR operations with AI-powered recruitment and comprehensive employee management.

_Built with ❤️ by the Staffly team_
