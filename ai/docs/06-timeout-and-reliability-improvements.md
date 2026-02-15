# Timeout and Reliability Improvements

This document outlines the improvements made to solve the Cohere API timeout issues and enhance the overall reliability of the AI service.

## Problems Identified

### 1. Short Timeout

- **Issue**: The original timeout was only 30 seconds, which was insufficient for complex CV evaluations
- **Impact**: Frequent timeout errors causing CV evaluations to fail
- **Solution**: Increased default timeout to 60 seconds with configurable options

### 2. Deprecated Model

- **Issue**: Using `command-r-plus` model which is deprecated and will be removed September 15, 2025
- **Impact**: Potential service disruption and warnings in logs
- **Solution**: Updated to use `command-r` model (current stable version)

### 3. No Retry Mechanism

- **Issue**: Single API call attempts with no retry logic
- **Impact**: Temporary network issues or API hiccups caused complete failures
- **Solution**: Implemented exponential backoff retry mechanism with configurable attempts

### 4. Poor Error Handling

- **Issue**: Generic error messages that didn't help with debugging
- **Impact**: Difficult to diagnose timeout and retry issues
- **Solution**: Enhanced logging with timing information and detailed error context

## Improvements Implemented

### 1. Enhanced Timeout Configuration

```python
# Before: Hardcoded 30-second timeout
response = future.result(timeout=30)

# After: Configurable timeout with environment variable
AI_TIMEOUT=60  # Configurable via environment
response = future.result(timeout=self.base_timeout)
```

### 2. Retry Logic with Exponential Backoff

```python
# Before: Single attempt, fail immediately
try:
    response = self.client.chat(...)
except Exception as e:
    return None

# After: Retry with exponential backoff
for attempt in range(self.max_retries):
    try:
        response = future.result(timeout=self.base_timeout)
        return response.text.strip()
    except concurrent.futures.TimeoutError:
        if attempt < self.max_retries - 1:
            wait_time = 2 ** attempt  # 1s, 2s, 4s delays
            time.sleep(wait_time)
            continue
        else:
            return None
```

### 3. Updated AI Model

```python
# Before: Deprecated model
model='command-r-plus'

# After: Current stable model
model='command-r'
```

### 4. Enhanced Logging

```python
# Before: Basic logging
logger.info("Sending CV evaluation request to Cohere API...")

# After: Detailed logging with timing
start_time = time.time()
logger.info(f"Sending CV evaluation request (attempt {attempt + 1}/{self.max_retries}, timeout: {self.base_timeout}s)...")
# ... after completion
elapsed_time = time.time() - start_time
logger.info(f"Successfully received response in {elapsed_time:.2f}s")
```

### 5. Configuration Management

```python
# New environment variables
AI_TIMEOUT=60          # Timeout for AI API calls in seconds
AI_MAX_RETRIES=3       # Maximum retry attempts for failed API calls
```

### 6. Improved Error Handling

```python
# Before: Generic fallback
except Exception as e:
    logger.error(f"CV evaluation error: {e}")
    # Basic fallback

# After: Specific error handling with context
except RuntimeError as e:
    if "Empty evaluation from AI" in str(e):
        logger.warning("AI service returned empty result, using heuristic fallback")
    else:
        logger.error(f"Runtime error during AI evaluation: {e}")
except Exception as e:
    if "timeout" in str(e).lower() or "timed out" in str(e).lower():
        logger.warning("AI evaluation timed out, using heuristic fallback")
    else:
        logger.error(f"Unexpected error during AI evaluation: {e}")
```

### 7. Health Check Endpoint

```python
@app.get("/health")
async def health_check():
    """Enhanced health check with service status and configuration"""
    return {
        "status": "healthy",
        "ai_service": {
            "cohere_configured": bool(cohere_service and cohere_service.api_key),
            "timeout_seconds": config['AI_TIMEOUT'],
            "max_retries": config['AI_MAX_RETRIES'],
            "model": "command-r",
            "client_status": "ready"
        }
    }
```

## Configuration Options

### Environment Variables

```bash
# AI Service Configuration
AI_TIMEOUT=60          # Timeout in seconds (default: 60)
AI_MAX_RETRIES=3       # Maximum retry attempts (default: 3)
```

### Recommended Settings

| Environment | Timeout | Retries | Reasoning                                    |
| ----------- | ------- | ------- | -------------------------------------------- |
| Development | 60s     | 2       | Faster feedback during development           |
| Staging     | 90s     | 3       | Balance between speed and reliability        |
| Production  | 120s    | 3-5     | Maximum reliability for production workloads |

## Monitoring and Debugging

### Health Check Endpoint

Monitor service health at `/health`:

```bash
curl http://localhost:5000/health
```

### Enhanced Logging

Look for these log patterns:

- `"Sending CV evaluation request (attempt X/Y, timeout: Zs)..."`
- `"Successfully received response in X.XXs"`
- `"Cohere API call timed out after X.XXs (attempt Y/Z)"`
- `"Waiting Xs before retry..."`

### Performance Metrics

- **Response Time**: Monitor how long evaluations take
- **Retry Frequency**: Track how often retries are needed
- **Timeout Rate**: Monitor timeout occurrences
- **Success Rate**: Track successful vs failed evaluations

## Testing the Improvements

### 1. Test Timeout Handling

```bash
# Set a very low timeout to test retry logic
AI_TIMEOUT=5 AI_MAX_RETRIES=3 python main.py
```

### 2. Test Retry Logic

```bash
# Set high retries to see exponential backoff
AI_MAX_RETRIES=5 python main.py
```

### 3. Monitor Health

```bash
# Check service status
curl http://localhost:5000/health
```

## Expected Results

### Before Improvements

- Frequent timeout errors after 30 seconds
- No retry attempts on failures
- Generic error messages
- Deprecated model warnings

### After Improvements

- Configurable timeouts (default 60s)
- Automatic retries with exponential backoff
- Detailed logging with timing information
- Current stable AI model
- Better error handling and fallback
- Health monitoring capabilities

## Troubleshooting

### Common Issues

1. **Still getting timeouts**: Increase `AI_TIMEOUT` value
2. **Too many retries**: Decrease `AI_MAX_RETRIES` value
3. **Slow responses**: Monitor health endpoint for service status
4. **Model errors**: Verify Cohere API key and model availability

### Performance Tuning

1. **High volume**: Increase timeout to 120-180 seconds
2. **Network issues**: Increase retries to 4-5
3. **Development**: Use lower timeouts for faster feedback
4. **Production**: Use higher timeouts for reliability

## Future Enhancements

1. **Circuit Breaker Pattern**: Implement circuit breaker for API failures
2. **Rate Limiting**: Add rate limiting for API calls
3. **Caching**: Implement response caching for repeated evaluations
4. **Metrics**: Add Prometheus metrics for monitoring
5. **Alerting**: Set up alerts for high timeout rates
