# Quick Start Guide - TypeScript Version

## Prerequisites

- **Node.js**: 20.x LTS or higher
- **npm**: 9.x or higher (comes with Node.js)
- **MongoDB**: 4.4+ (local or remote)
- **AWS Account**: For S3 file storage (optional for development)

## Installation Steps

### 1. Install Dependencies

```bash
cd services/ats-system-checker
npm install
```

This will install all required packages including:
- Express.js and TypeScript
- Mongoose for MongoDB
- AWS SDK for S3
- All other dependencies

### 2. Configure Environment

```bash
# Copy the example environment file
cp .example.env .env

# Edit .env with your configuration
# At minimum, configure:
# - MONGODB_URL
# - AWS credentials (if using S3)
# - Email credentials (if using email notifications)
```

### 3. Start the Application

**Development Mode (with hot reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
# Build TypeScript to JavaScript
npm run build

# Start the compiled application
npm start
```

### 4. Verify Installation

Check that the server is running:
```bash
curl http://localhost:4002/ats-checker/health/simple
```

Expected response:
```json
{
  "status": "healthy",
  "message": "ATS System is operational",
  "version": "2.0.0"
}
```

## Development Workflow

### Running in Development

```bash
npm run dev
```

This will:
- Start the server with hot reload
- Watch for file changes
- Automatically restart on code changes
- Show TypeScript compilation errors

### Building for Production

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

### Running Tests

```bash
# When tests are added
npm test
```

## Project Structure

```
src/
├── index.ts                 # Main application entry point
├── config/                  # Configuration files
│   ├── env.config.ts       # Environment variables
│   └── database.config.ts  # Database connection
├── controllers/            # Business logic
├── models/                 # Database & API models
├── routes/                  # API route definitions
├── services/               # External service integrations
├── middlewares/            # Request/response middleware
└── utils/                  # Utility functions
```

## Common Commands

```bash
# Development
npm run dev              # Start with hot reload

# Production
npm run build           # Compile TypeScript
npm start               # Run compiled code

# Code Quality (when configured)
npm run lint            # Lint TypeScript code
npm run format          # Format code
```

## Troubleshooting

### Port Already in Use

If port 4002 is already in use:
```bash
# Change PORT in .env file
PORT=4003
```

### MongoDB Connection Issues

Ensure MongoDB is running:
```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"
```

### TypeScript Compilation Errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Missing Environment Variables

Check that `.env` file exists and contains required variables:
```bash
cat .env | grep MONGODB_URL
```

## Next Steps

1. **Test API Endpoints**: Use Postman or curl to test endpoints
2. **Configure S3**: Set up AWS S3 bucket for file storage
3. **Set Up Email**: Configure email service for notifications
4. **Review Documentation**: Check other docs in the `docs/` folder

## API Testing Examples

### Health Check
```bash
curl http://localhost:4002/ats-checker/health/simple
```

### Create Job Posting
```bash
curl -X POST http://localhost:4002/ats-checker/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-User-Id: YOUR_USER_ID" \
  -d '{
    "title": "Software Engineer",
    "description": "We are looking for...",
    "required_skills": "Python, JavaScript, React"
  }'
```

### Upload File to S3
```bash
curl -X POST http://localhost:4002/ats-checker/s3/upload \
  -F "file=@resume.pdf"
```

## Getting Help

- Check the [TypeScript Migration Guide](./08-typescript-migration.md)
- Review [Backend Development Overview](./00-backend-development-overview.md)
- See [API Documentation](./README.md) for endpoint details

