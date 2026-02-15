# Use Node.js 20 slim image as base
FROM node:20-slim

# Install build dependencies for native modules
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (skip scripts since fix-packages.js is Windows-only)
# Using npm install instead of npm ci - it's more forgiving with lock file issues
# If package-lock.json is corrupted, npm install will handle it gracefully
RUN npm install --ignore-scripts --legacy-peer-deps

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Remove development dependencies and unnecessary files (not needed in production)
RUN npm prune --production && \
  rm -rf src/ tsconfig.json

# Create necessary directories for uploads and evaluations
RUN mkdir -p uploads evaluations

# Expose the port
EXPOSE 4002

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4002/ats-checker/health/simple', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the application
CMD ["npm", "start"]

