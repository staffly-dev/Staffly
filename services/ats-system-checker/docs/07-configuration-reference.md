# ATS Backend Service Configuration Reference

This document describes all available configuration options for the ATS backend service.

## Environment Variables

### Required Configuration

- **`MONGODB_URL`**: MongoDB connection URL

  - Default: None (required)
  - Example: `MONGODB_URL=mongodb://localhost:27017/ats_system`

- **`AWS_ACCESS_KEY_ID`**: AWS Access Key ID for S3 integration

  - Default: None (required for S3)
  - Example: `AWS_ACCESS_KEY_ID=your_access_key`

- **`AWS_SECRET_ACCESS_KEY`**: AWS Secret Access Key for S3 integration

  - Default: None (required for S3)
  - Example: `AWS_SECRET_ACCESS_KEY=your_secret_key`

- **`AWS_S3_BUCKET`**: AWS S3 bucket name for file storage
  - Default: None (required for S3)
  - Example: `AWS_S3_BUCKET=my-ats-bucket`

### Application Configuration

- **`ENV`**: Application environment

  - Default: `development`
  - Values: `development`, `staging`, `production`

- **`DEBUG`**: Debug mode (enables detailed logging and error messages)

  - Default: `true`
  - Values: `true` or `false`

- **`AUTO_RELOAD`**: Enable auto-reload on file changes (development only)

  - Default: `true`
  - Values: `true` or `false`
  - **Note**: This controls the file watching loop that was causing the `watchfiles.main` messages

- **`BACKEND_URL`**: Backend base URL for generating links
  - Default: None
  - Example: `BACKEND_URL=http://localhost:4002`

### Server Configuration

- **`API_HOST`**: Host address to bind the server to

  - Default: `0.0.0.0`
  - Example: `API_HOST=127.0.0.1`

- **`API_PORT`**: Port number for the server
  - Default: `4002`
  - Example: `API_PORT=8000`

### AI Service Configuration

- **`AI_SERVICE_URL`**: URL of the AI service for CV evaluation

  - Default: None
  - Example: `AI_SERVICE_URL=http://localhost:5000`

- **`AI_SERVICE_ENABLED`**: Whether AI service is enabled

  - Default: `true`
  - Values: `true` or `false`

- **`AI_SERVICE_FALLBACK`**: Whether to use fallback evaluation when AI fails
  - Default: `true`
  - Values: `true` or `false`

### Email Configuration

- **`GMAIL_USER`**: Gmail user for sending notifications

  - Default: `your_email@gmail.com`
  - Example: `GMAIL_USER=hr@company.com`

- **`GMAIL_PASSWORD`**: Gmail app password
  - Default: None (required for email)
  - Example: `GMAIL_PASSWORD=your_app_password`

### Security Configuration

- **`SECRET_KEY`**: Secret key for JWT token signing

  - Default: None (required for authentication)
  - Example: `SECRET_KEY=your_secret_key_here`

- **`DOCS_USERNAME`**: Username for API documentation access

  - Default: `admin`
  - Example: `DOCS_USERNAME=myuser`

- **`DOCS_PASSWORD`**: Password for API documentation access

  - Default: `admin123`
  - Example: `DOCS_PASSWORD=mypassword`

- **`DOCS_AUTH_ENABLED`**: Whether to enable authentication for documentation
  - Default: `true`
  - Values: `true` or `false`

### CORS Configuration

- **`CORS_ALLOW_ORIGINS`**: Comma-separated list of allowed origins

  - Default: None
  - Example: `CORS_ALLOW_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`

- **`CORS_ALLOW_CREDENTIALS`**: Whether to allow credentials with CORS
  - Default: `true`
  - Values: `true` or `false`

### File Upload Configuration

- **`MAX_FILE_SIZE`**: Maximum file size in bytes

  - Default: `16777216` (16MB)
  - Example: `MAX_FILE_SIZE=33554432` (32MB)

- **`ALLOWED_EXTENSIONS`**: Comma-separated list of allowed file extensions

  - Default: `pdf,docx`
  - Example: `ALLOWED_EXTENSIONS=pdf,docx,txt`

- **`ALLOW_JOB_APPLICATION_UPLOADS`**: Whether to allow file uploads for job applications

  - Default: `true`
  - Values: `true` or `false`

- **`ALLOW_GENERAL_FILE_UPLOADS`**: Whether to allow general file uploads
  - Default: `false` (disabled for security)
  - Values: `true` or `false`

### Rate Limiting Configuration

- **`RATE_LIMIT`**: Rate limiting configuration

  - Default: `100/minute`
  - Example: `RATE_LIMIT=200/minute`

- **`DDOS_LIMIT`**: DDoS protection limit
  - Default: `100`
  - Example: `DDOS_LIMIT=200`

## Example Configuration File

```bash
# .env file example for ATS Backend Service

# Required Configuration
MONGODB_URL=mongodb://localhost:27017/ats_system
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=my-ats-bucket

# Application Configuration
ENV=development
DEBUG=true
AUTO_RELOAD=false  # Disable file watching loop
BACKEND_URL=http://localhost:4002

# AI Service Configuration
AI_SERVICE_URL=http://localhost:5000
AI_SERVICE_ENABLED=true
AI_SERVICE_FALLBACK=true

# Email Configuration
GMAIL_USER=hr@company.com
GMAIL_PASSWORD=your_app_password

# Security Configuration
SECRET_KEY=your_secret_key_here
DOCS_USERNAME=admin
DOCS_PASSWORD=admin123
DOCS_AUTH_ENABLED=true

# CORS Configuration
CORS_ALLOW_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CORS_ALLOW_CREDENTIALS=true

# Server Configuration
API_HOST=0.0.0.0
API_PORT=4002

# File Upload Configuration
MAX_FILE_SIZE=16777216
ALLOWED_EXTENSIONS=pdf,docx
ALLOW_JOB_APPLICATION_UPLOADS=true
ALLOW_GENERAL_FILE_UPLOADS=false

# Rate Limiting
RATE_LIMIT=100/minute
DDOS_LIMIT=100
```

## Stopping the File Watching Loop

To stop the `watchfiles.main - INFO - 1 change detected` messages, you have several options:

### Option 1: Disable Auto-reload (Recommended)

```bash
# Set this environment variable
AUTO_RELOAD=false
```

### Option 2: Change Environment to Production

```bash
# This disables both DEBUG and AUTO_RELOAD
ENV=production
```

### Option 3: Disable Debug Mode

```bash
# This disables DEBUG mode
DEBUG=false
```

### Option 4: Use the new configuration option

```bash
# The service now respects AUTO_RELOAD=false
AUTO_RELOAD=false
```

## Performance Tuning

### Development vs Production

| Setting       | Development   | Production   | Reasoning                                  |
| ------------- | ------------- | ------------ | ------------------------------------------ |
| `DEBUG`       | `true`        | `false`      | Detailed logging in dev, security in prod  |
| `AUTO_RELOAD` | `false`       | `false`      | Disable file watching in both environments |
| `ENV`         | `development` | `production` | Environment-specific behaviors             |

### File Watching Control

- **`AUTO_RELOAD=true`**: Enables file watching and auto-reload (causes the loop)
- **`AUTO_RELOAD=false`**: Disables file watching and auto-reload (stops the loop)

## Troubleshooting

### Common Issues

1. **File watching loop**: Set `AUTO_RELOAD=false`
2. **High CPU usage**: Disable auto-reload and debug mode
3. **Memory leaks**: Use production environment settings
4. **Slow startup**: Disable unnecessary development features

### Monitoring

Monitor these metrics to optimize configuration:

- CPU usage during file watching
- Memory consumption
- Startup time
- File system I/O

## Best Practices

1. **Development**: Use `AUTO_RELOAD=false` to avoid file watching loops
2. **Production**: Always use `ENV=production` and `DEBUG=false`
3. **Security**: Keep `ALLOW_GENERAL_FILE_UPLOADS=false`
4. **Performance**: Monitor and adjust rate limiting based on usage
