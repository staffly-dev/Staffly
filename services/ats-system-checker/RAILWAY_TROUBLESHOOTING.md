# 🚂 Railway Deployment Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. Application Failed to Respond

**Symptoms:**

- Error: "Application failed to respond"
- 502 Bad Gateway
- Application timeout

**Solutions:**

#### A. Check Environment Variables

Ensure these critical variables are set in Railway:

```bash
# Required for docs to work
DOCS_AUTH_ENABLED=true
DOCS_USERNAME=stafflyhradmin10122002
DOCS_PASSWORD=stafflyhradmin10122002

# Required for basic functionality
ENV=production
DEBUG=false
MONGODB_URL=your_mongodb_connection_string
```

#### B. Check Railway Logs

1. Go to Railway Dashboard
2. Select your project
3. Click on "Deployments"
4. Click on the latest deployment
5. Check "Build Logs" and "Deploy Logs"

#### C. Verify Database Connection

Ensure your MongoDB connection string is:

- Accessible from Railway's IP addresses
- Has the correct credentials
- Database exists and is accessible

### 2. Documentation Endpoints Not Working

**Symptoms:**

- `/docs` returns 401 Unauthorized
- Authentication prompts not working
- CORS errors

**Solutions:**

#### A. Verify Authentication Settings

```bash
# Check these are set correctly
railway variables list | grep DOCS
```

#### B. Test Authentication

```bash
# Test with curl
curl -u "stafflyhradmin10122002:stafflyhradmin10122002" \
  https://ats-system-checker-backend-production.up.railway.app/docs
```

#### C. Check CORS Configuration

Ensure your frontend domain is in the allowed origins:

```bash
CORS_ALLOW_ORIGINS=https://staffly.vercel.app,https://your-domain.com
```

### 3. Port Configuration Issues

**Symptoms:**

- Application starts but not accessible
- Port binding errors

**Solutions:**

#### A. Check Railway Port

Railway automatically sets the `PORT` environment variable. Ensure your app uses it:

```python
# In main.py
port = os.getenv("PORT", 4000)
```

#### B. Update Dockerfile

```dockerfile
# Use Railway's PORT
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "4000"]
```

### 4. Build Failures

**Symptoms:**

- Docker build fails
- Dependencies not found

**Solutions:**

#### A. Check Requirements

Ensure `requirements.txt` has all dependencies:

```bash
pip freeze > requirements.txt
```

#### B. Update Dockerfile

```dockerfile
# Install system dependencies first
RUN apt-get update && apt-get install -y gcc
```

## 🔧 Quick Fix Commands

### 1. Redeploy with Fresh Environment

```bash
# In Railway CLI
railway up --detach
```

### 2. Check Application Status

```bash
# Health check
curl https://ats-system-checker-backend-production.up.railway.app/ats-checker/health/simple
```

### 3. View Real-time Logs

```bash
railway logs --follow
```

### 4. Restart Service

```bash
railway service restart
```

## 📋 Environment Variables Checklist

### Required Variables

- [ ] `DOCS_AUTH_ENABLED=true`
- [ ] `DOCS_USERNAME=stafflyhradmin10122002`
- [ ] `DOCS_PASSWORD=stafflyhradmin10122002`
- [ ] `ENV=production`
- [ ] `DEBUG=false`
- [ ] `MONGODB_URL=your_connection_string`
- [ ] `COHERE_API_KEY=your_api_key`

### Optional but Recommended

- [ ] `FORCE_HTTPS=true`
- [ ] `CORS_ALLOW_ORIGINS=https://your-frontend-domain.com`
- [ ] `LOG_LEVEL=INFO`

## 🚀 Deployment Steps

### 1. Set Environment Variables

```bash
railway variables set DOCS_AUTH_ENABLED=true
railway variables set DOCS_USERNAME=stafflyhradmin10122002
railway variables set DOCS_PASSWORD=stafflyhradmin10122002
railway variables set ENV=production
```

### 2. Deploy

```bash
railway up
```

### 3. Verify Deployment

```bash
# Check health
curl https://ats-system-checker-backend-production.up.railway.app/ats-checker/health/simple

# Check docs (should prompt for auth)
curl -I https://ats-system-checker-backend-production.up.railway.app/docs
```

## 📞 Getting Help

### 1. Check Railway Status

- [Railway Status Page](https://status.railway.app/)

### 2. View Application Logs

- Railway Dashboard → Your Project → Deployments → Latest → Logs

### 3. Common Error Codes

- `502`: Application not responding
- `503`: Service unavailable
- `401`: Authentication required
- `403`: Forbidden (CORS/security)

### 4. Support Resources

- [Railway Documentation](https://docs.railway.app/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Railway Discord](https://discord.gg/railway)
