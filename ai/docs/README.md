# AI Service Documentation

Welcome to the comprehensive documentation for the ATS AI Service. This documentation covers all aspects of the AI service implementation, from API endpoints to security features, troubleshooting, and deployment.

## 📚 Documentation Structure

### 1. [API Documentation Security](01-api-documentation-security.md)

**Protecting API documentation endpoints**

- HTTP Basic Authentication implementation
- Middleware configuration and security flow
- Credential management and best practices
- Monitoring, logging, and troubleshooting

### 2. [API Endpoints Reference](02-api-endpoints-reference.md)

**Complete API documentation and usage**

- All endpoint details with examples
- Request/response formats
- Status codes and error handling
- Testing examples and curl commands
- Performance and rate limiting information

### 3. [Data Models Reference](03-data-models-reference.md)

**Comprehensive data model documentation**

- Request and response models
- Field validation rules
- Data types and constraints
- Example JSON structures
- Model relationships and usage

### 4. [Troubleshooting and Deployment](04-troubleshooting-and-deployment.md)

**Complete troubleshooting and deployment guide**

- Common issues and solutions
- Development environment setup
- Production deployment
- Monitoring and logging
- Security best practices

### 5. [Integration Guide](05-integration-guide.md)

**Developer integration and usage guide**

- API integration patterns
- Code examples in multiple languages
- Error handling and best practices
- Performance optimization
- Testing and validation

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Cohere API key
- Docker (optional)

### Installation

```bash
# Navigate to AI service directory
cd ai

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp env.template .env
# Edit .env with your configuration

# Run the service
python -m ai.main
```

### API Documentation

Once the service is running, visit:

- **Swagger UI**: http://localhost:5000/docs (Authentication Required)
- **ReDoc**: http://localhost:5000/redoc (Authentication Required)

**Note**: API documentation requires authentication. Default credentials are `admin:admin123`. See [API Documentation Security](01-api-documentation-security.md) for details.

## 🔧 Development

### Project Structure

```
ai/
├── main.py              # Main FastAPI application
├── middlewares.py       # Authentication middleware
├── services/            # AI service integrations
├── models/              # Data models and schemas
├── utils/               # Utility functions
├── docs/                # Documentation
├── env.template         # Environment template
└── test_auth.py         # Authentication testing
```

### Key Features

- **CV Evaluation**: AI-powered CV analysis against job requirements
- **Quiz Generation**: Dynamic quiz creation from job descriptions
- **Text Extraction**: Document processing and text extraction
- **Security**: Protected API documentation with authentication

## 🛡️ Security Features

- **API Docs Protection**: HTTP Basic Authentication for documentation endpoints
- **Environment Variables**: Secure credential management
- **Logging**: Comprehensive access logging and monitoring
- **CORS Protection**: Configurable cross-origin resource sharing

## 🔍 Testing

### Test Authentication

```bash
python test_auth.py
```

### Test API Endpoints

```bash
# Health check (no auth required)
curl http://localhost:5000/health

# Root endpoint (no auth required)
curl http://localhost:5000/

# Docs endpoint (auth required)
curl -u "admin:admin123" http://localhost:5000/docs
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build the image
docker build -t ats-ai .

# Run the container
docker run --env-file .env -p 5000:5000 ats-ai
```

### Environment Variables

```bash
# AI Service Configuration
COHERE_API_KEY=your_cohere_api_key_here

# Server Configuration
AI_HOST=0.0.0.0
AI_PORT=5000

# CORS Configuration
CORS_ALLOW_ORIGINS=http://localhost:3000
CORS_ALLOW_CREDENTIALS=true

# API Documentation Authentication
DOCS_USERNAME=your_secure_username
DOCS_PASSWORD=your_secure_password
DOCS_AUTH_ENABLED=true
```

## 📖 Additional Resources

- **[Environment Template](../env.template)** - Sample environment variables
- **[Authentication Test Script](../test_auth.py)** - Security testing
- **[Main README](../README.md)** - Service overview and setup

## 🔐 Security Notice

**Important**: The API documentation endpoints are protected with HTTP Basic Authentication. Default credentials are `admin:admin123`. **Change these immediately in production!**

See [API Documentation Security](01-api-documentation-security.md) for complete security details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Need Help?

If you encounter issues:

1. **Check the troubleshooting guide**: [Troubleshooting and Deployment](04-troubleshooting-and-deployment.md)
2. **Review API documentation**: [API Endpoints Reference](02-api-endpoints-reference.md)
3. **Check data models**: [Data Models Reference](03-data-models-reference.md)
4. **Verify security setup**: [API Documentation Security](01-api-documentation-security.md)
5. **Check service logs**: Review `ats_ai.log` for error details

For additional support, check the main [README](../README.md) or create an issue in the repository.
