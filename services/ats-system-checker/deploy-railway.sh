#!/bin/bash

# Railway Deployment Script for ATS System Checker
echo "🚀 Deploying ATS System Checker to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Login to Railway (if not already logged in)
echo "🔐 Logging into Railway..."
railway login

# Link to project (if not already linked)
echo "🔗 Linking to Railway project..."
railway link

# Set environment variables
echo "⚙️ Setting environment variables..."
railway variables set DOCS_AUTH_ENABLED=true
railway variables set DOCS_USERNAME=stafflyhradmin10122002
railway variables set DOCS_PASSWORD=stafflyhradmin10122002
railway variables set ENV=production
railway variables set DEBUG=false
railway variables set FORCE_HTTPS=true

# Deploy the application
echo "🚀 Deploying application..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your application should be available at:"
echo "   https://ats-system-checker-backend-production.up.railway.app"
echo "📚 API Documentation:"
echo "   https://ats-system-checker-backend-production.up.railway.app/docs"
echo "🔑 Default credentials: stafflyhradmin10122002:stafflyhradmin10122002"
