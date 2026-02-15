# Use Node.js LTS image
FROM node:20-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  && rm -rf /var/lib/apt/lists/*

# Copy package files (for better layer caching)
COPY package.json package-lock.json* ./
COPY fix-packages.js ./

# Install dependencies
RUN npm install

# Copy source files
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Remove development dependencies and fix-packages.js (not needed in production)
RUN npm prune --production && \
  rm -f fix-packages.js

# Create necessary directories
RUN mkdir -p uploads evaluations

# Expose port
EXPOSE 4002

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4002

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4002/ats-checker/health/simple', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "start"]
