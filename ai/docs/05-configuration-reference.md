# AI Service Configuration Reference

This document describes all available configuration options for the AI service.

## Environment Variables

### Required Configuration

- **`COHERE_API_KEY`**: Your Cohere AI API key for CV evaluation and quiz generation
  - Default: None (required for AI features)
  - Example: `COHERE_API_KEY=your_api_key_here`

### CORS Configuration

- **`CORS_ALLOW_ORIGINS`**: Comma-separated list of allowed origins for CORS

  - Default: None
  - Example: `CORS_ALLOW_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`

- **`CORS_ALLOW_CREDENTIALS`**: Whether to allow credentials in CORS requests
  - Default: `true`
  - Values: `true` or `false`

### Documentation Authentication

- **`DOCS_USERNAME`**: Username for accessing API documentation

  - Default: `admin`
  - Example: `DOCS_USERNAME=myuser`

- **`DOCS_PASSWORD`**: Password for accessing API documentation

  - Default: `admin123`
  - Example: `DOCS_PASSWORD=mypassword`

- **`DOCS_AUTH_ENABLED`**: Whether to enable authentication for documentation
  - Default: `true`
  - Values: `true` or `false`

### Environment

- **`ENV`**: Application environment
  - Default: `development`
  - Values: `development`, `staging`, `production`

### Server Configuration

- **`AI_HOST`**: Host address to bind the server to

  - Default: `0.0.0.0`
  - Example: `AI_HOST=127.0.0.1`

- **`AI_PORT`**: Port number for the server
  - Default: `5000`
  - Example: `AI_PORT=8000`

### AI Service Configuration

- **`AI_TIMEOUT`**: Timeout for AI API calls in seconds

  - Default: `60`
  - Range: 30-300 seconds
  - Example: `AI_TIMEOUT=90`

- **`AI_MAX_RETRIES`**: Maximum retry attempts for failed API calls

  - Default: `3`
  - Range: 1-5
  - Example: `AI_MAX_RETRIES=5`

- **`AI_AUTO_RELOAD`**: Enable/disable automatic reloading on file changes (development only)
  - Default: `true`
  - Values: `true` or `false`
  - Example: `AI_AUTO_RELOAD=false`

## Example Configuration File

```bash
# .env file example
COHERE_API_KEY=your_cohere_api_key_here
CORS_ALLOW_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CORS_ALLOW_CREDENTIALS=true
DOCS_USERNAME=admin
DOCS_PASSWORD=admin123
DOCS_AUTH_ENABLED=true
ENV=development
AI_HOST=0.0.0.0
AI_PORT=5000
AI_TIMEOUT=60
AI_MAX_RETRIES=3
AI_AUTO_RELOAD=false
```

## Performance Tuning

### Timeout Configuration

- **Development**: Use 60-90 seconds for testing and development
- **Production**: Use 120-180 seconds for production workloads
- **High-volume**: Consider increasing to 300 seconds for high-volume scenarios

### Retry Configuration

- **Development**: Use 2-3 retries for faster feedback
- **Production**: Use 3-5 retries for reliability
- **Network issues**: Increase retries if experiencing network instability

## Troubleshooting

### Common Issues

1. **Timeout errors**: Increase `AI_TIMEOUT` value
2. **API failures**: Increase `AI_MAX_RETRIES` value
3. **CORS issues**: Check `CORS_ALLOW_ORIGINS` configuration
4. **Documentation access**: Verify `DOCS_USERNAME` and `DOCS_PASSWORD`

### Monitoring

Monitor these metrics to optimize configuration:

- API response times
- Retry frequency
- Error rates
- Timeout occurrences
