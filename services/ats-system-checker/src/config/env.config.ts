import path from "path";
import { getEnv } from "../utils/get-env";
import dotenv from 'dotenv';

dotenv.config();
// Use process.cwd() for CommonJS compatibility
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const envConfig = () => ({
  // Server Configuration
  API_HOST: getEnv("API_HOST", "0.0.0.0"),
  API_PORT: parseInt(getEnv("API_PORT", "4002")),
  PORT: parseInt(getEnv("PORT", "4002")),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  ENV: getEnv("ENV", "development"),
  DEBUG: getEnv("DEBUG", "true") === "true",
  AUTO_RELOAD: getEnv("AUTO_RELOAD", "true") === "true",

  // Backend URL
  BACKEND_URL: getEnv("BACKEND_URL", "http://localhost:4002"),
  PRODUCTION_URL: getEnv("PRODUCTION_URL", "https://ats-system-checker-backend-production.up.railway.app"),
  UPLOADS_BASE_URL: getEnv("UPLOADS_BASE_URL", "http://localhost:4002"),

  // AI Service Configuration
  AI_SERVICE_URL: getEnv("AI_SERVICE_URL", "http://localhost:5000"),
  AI_SERVICE_ENABLED: getEnv("AI_SERVICE_ENABLED", "true") === "true",
  AI_SERVICE_FALLBACK: getEnv("AI_SERVICE_FALLBACK", "true") === "true",
  COHERE_API_KEY: getEnv("COHERE_API_KEY", ""),

  // Database Configuration
  MONGODB_URL: getEnv("MONGODB_URL", "mongodb://localhost:27017"),
  MONGODB_DATABASE: getEnv("MONGODB_DATABASE", "ats_system"),

  // Email Configuration
  EMAIL_FROM: getEnv("EMAIL_FROM", ""),
  RESEND_API_KEY: getEnv("RESEND_API_KEY", ""),

  // Security Configuration
  SECRET_KEY: getEnv("SECRET_KEY", ""),
  JWT_ALGORITHM: getEnv("JWT_ALGORITHM", "HS256"),
  ACCESS_TOKEN_EXPIRE_MINUTES: parseInt(getEnv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")),
  REFRESH_TOKEN_EXPIRE_MINUTES: parseInt(getEnv("REFRESH_TOKEN_EXPIRE_MINUTES", "43200")),
  JWT_SECRET: getEnv("JWT_SECRET", ""),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "30m"),
  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET", ""),
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "30d"),

  // API Documentation Authentication
  DOCS_USERNAME: getEnv("DOCS_USERNAME", "admin"),
  DOCS_PASSWORD: getEnv("DOCS_PASSWORD", "admin123"),
  DOCS_AUTH_ENABLED: getEnv("DOCS_AUTH_ENABLED", "true") === "true",

  // CORS Configuration
  CORS_ALLOW_ORIGINS: getEnv("CORS_ALLOW_ORIGINS", ""),
  CORS_ALLOW_CREDENTIALS: getEnv("CORS_ALLOW_CREDENTIALS", "true") === "true",
  CORS_ORIGIN: getEnv("CORS_ORIGIN", ""),
  CORS_METHODS: getEnv("CORS_METHODS", "GET,POST,PUT,DELETE,OPTIONS"),
  CORS_ALLOWED_HEADERS: getEnv("CORS_ALLOWED_HEADERS", "Content-Type,Authorization,X-Requested-With,X-CSRF-Token"),
  CORS_EXPOSED_HEADERS: getEnv("CORS_EXPOSED_HEADERS", "X-CSRF-Token"),
  CORS_MAX_AGE: parseInt(getEnv("CORS_MAX_AGE", "86400")),
  CORS_WHITELIST: getEnv("CORS_WHITELIST", ""),
  CORS_BLACKLIST: getEnv("CORS_BLACKLIST", ""),
  CORS_SECURITY_HEADERS: getEnv("CORS_SECURITY_HEADERS", "true") === "true",
  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "http://localhost:3000"),

  // Rate Limiting
  RATE_LIMIT: getEnv("RATE_LIMIT", "100/minute"),
  RATE_LIMIT_WINDOW_MS: parseInt(getEnv("RATE_LIMIT_WINDOW_MS", "900000")),
  RATE_LIMIT_MAX_REQUESTS: parseInt(getEnv("RATE_LIMIT_MAX_REQUESTS", "100")),
  GLOBAL_RATE_LIMIT_WINDOW_MS: parseInt(getEnv("GLOBAL_RATE_LIMIT_WINDOW_MS", "60000")),
  GLOBAL_RATE_LIMIT_MAX_REQUESTS: parseInt(getEnv("GLOBAL_RATE_LIMIT_MAX_REQUESTS", "1000")),
  STRICT_RATE_LIMIT_WINDOW_MS: parseInt(getEnv("STRICT_RATE_LIMIT_WINDOW_MS", "60000")),
  STRICT_RATE_LIMIT_MAX_REQUESTS: parseInt(getEnv("STRICT_RATE_LIMIT_MAX_REQUESTS", "10")),

  // DDoS Protection
  DDOS_LIMIT: parseInt(getEnv("DDOS_LIMIT", "100")),
  DDOS_BURST: parseInt(getEnv("DDOS_BURST", "50")),
  DDOS_WINDOW_MS: parseInt(getEnv("DDOS_WINDOW_MS", "60000")),
  DDOS_BLACKLIST: getEnv("DDOS_BLACKLIST", ""),
  DDOS_WHITELIST: getEnv("DDOS_WHITELIST", ""),
  DDOS_AUTO_BAN_COUNT: parseInt(getEnv("DDOS_AUTO_BAN_COUNT", "5")),
  DDOS_AUTO_BAN_TIME: parseInt(getEnv("DDOS_AUTO_BAN_TIME", "300000")),

  // Security
  FORCE_HTTPS: getEnv("FORCE_HTTPS", "true") === "true",
  SESSION_COOKIE_SECURE: getEnv("SESSION_COOKIE_SECURE", "true") === "true",
  CSRF_COOKIE_SECURE: getEnv("CSRF_COOKIE_SECURE", "true") === "true",
  SECURE_COOKIES: getEnv("SECURE_COOKIES", "true") === "true",
  TRUSTED_IPS: getEnv("TRUSTED_IPS", "127.0.0.1,::1"),

  // File Upload Configuration
  UPLOAD_FOLDER: getEnv("UPLOAD_FOLDER", "uploads"),
  EVALUATIONS_FOLDER: getEnv("EVALUATIONS_FOLDER", "evaluations"),
  MAX_FILE_SIZE: parseInt(getEnv("MAX_FILE_SIZE", "16777216")),
  ALLOWED_EXTENSIONS: getEnv("ALLOWED_EXTENSIONS", "pdf,docx"),
  ALLOW_JOB_APPLICATION_UPLOADS: getEnv("ALLOW_JOB_APPLICATION_UPLOADS", "true") === "true",
  ALLOW_GENERAL_FILE_UPLOADS: getEnv("ALLOW_GENERAL_FILE_UPLOADS", "false") === "true",

  // Quiz Configuration
  QUIZ_TIME_LIMIT: parseInt(getEnv("QUIZ_TIME_LIMIT", "300")),
  QUIZ_PASS_THRESHOLD: parseInt(getEnv("QUIZ_PASS_THRESHOLD", "7")),

  // AWS S3 Configuration
  AWS_ACCESS_KEY_ID: getEnv("AWS_ACCESS_KEY_ID", ""),
  AWS_SECRET_ACCESS_KEY: getEnv("AWS_SECRET_ACCESS_KEY", ""),
  AWS_REGION: getEnv("AWS_REGION", "us-east-1"),
  AWS_S3_BUCKET: getEnv("AWS_S3_BUCKET", ""),
  AWS_S3_BUCKET_URL: getEnv("AWS_S3_BUCKET_URL", ""),

  // Logging
  LOG_LEVEL: getEnv("LOG_LEVEL", "INFO"),
  LOG_FILE: getEnv("LOG_FILE", "ats_system.log"),

  // Redis Configuration
  UPSTASH_REDIS_REST_URL: getEnv("UPSTASH_REDIS_REST_URL", ""),
  UPSTASH_REDIS_REST_TOKEN: getEnv("UPSTASH_REDIS_REST_TOKEN", ""),

  // API Gateway Base URL
  API_GATEWAY_BASE_URL: getEnv("API_GATEWAY_BASE_URL", "http://localhost:4000"),
});

// Add helper methods
const env = envConfig();

// Helper functions
function isProduction(): boolean {
  if (env.ENV.toLowerCase() === "production") return true;
  if (process.env.HOSTNAME?.toLowerCase().includes("railway")) return true;
  if (process.env.DYNO) return true;
  if (process.env.AWS_EXECUTION_ENV) return true;
  if (process.env.GOOGLE_CLOUD_PROJECT) return true;
  if (process.env.WEBSITE_SITE_NAME) return true;
  if (env.DEBUG === false) return true;
  return false;
}

function isDevelopment(): boolean {
  return env.ENV.toLowerCase() === "development";
}

function getBackendUrl(): string {
  if (env.BACKEND_URL && env.BACKEND_URL.trim()) {
    const clean_url = env.BACKEND_URL.trim().replace(/[,/]+$/, "");
    if (clean_url && !clean_url.endsWith(",")) {
      return clean_url;
    }
  }
  return isDevelopment()
    ? "http://localhost:4002"
    : env.PRODUCTION_URL || "https://ats-system-checker-backend-production.up.railway.app";
}

function getUploadsUrl(): string {
  if (env.UPLOADS_BASE_URL && env.UPLOADS_BASE_URL.trim()) {
    const clean_url = env.UPLOADS_BASE_URL.trim().replace(/[,/]+$/, "");
    if (clean_url && !clean_url.endsWith(",")) {
      return clean_url;
    }
  }
  return isDevelopment()
    ? "http://localhost:4002"
    : env.PRODUCTION_URL || "https://ats-system-checker-backend-production.up.railway.app";
}

function getCorsOrigins(): string[] {
  const origins: string[] = [];

  if (env.CORS_ALLOW_ORIGINS) {
    origins.push(...env.CORS_ALLOW_ORIGINS.split(",").map(o => o.trim()));
  }

  if (env.CORS_ORIGIN && !origins.includes(env.CORS_ORIGIN)) {
    origins.push(env.CORS_ORIGIN.replace(/\/+$/, ""));
  }

  if (env.FRONTEND_ORIGIN && !origins.includes(env.FRONTEND_ORIGIN)) {
    origins.push(env.FRONTEND_ORIGIN.replace(/\/+$/, ""));
  }

  if (isDevelopment()) {
    const dev_origins = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:4002",
      "http://127.0.0.1:4002",
      "http://localhost:4000",
      "http://127.0.0.1:4000"
    ];
    dev_origins.forEach(origin => {
      if (!origins.includes(origin)) {
        origins.push(origin);
      }
    });
  }

  return origins;
}

export const Env = {
  ...env,
  get is_production(): boolean {
    return isProduction();
  },
  get is_development(): boolean {
    return isDevelopment();
  },
  get_backend_url(): string {
    return getBackendUrl();
  },
  get_uploads_url(): string {
    return getUploadsUrl();
  },
  get_cors_origins(): string[] {
    return getCorsOrigins();
  }
};

