"""
Settings configuration for ATS System Backend
Uses Pydantic for environment variable validation and management
"""

import os
from functools import lru_cache
from typing import Set
from pydantic import Field, validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # AI/API Configuration
    COHERE_API_KEY: str = Field(default="", description="Cohere API key for AI services")
    
    # Email Configuration
    GMAIL_USER: str = Field(default="your_email@gmail.com", description="Gmail user for notifications")
    GMAIL_PASSWORD: str = Field(default="", description="Gmail app password")
    
    # AWS S3 Configuration
    AWS_ACCESS_KEY_ID: str = Field(default="", description="AWS Access Key ID")
    AWS_SECRET_ACCESS_KEY: str = Field(default="", description="AWS Secret Access Key")
    AWS_REGION: str = Field(default="us-east-1", description="AWS Region")
    AWS_S3_BUCKET: str = Field(default="", description="AWS S3 Bucket name")
    AWS_S3_BUCKET_URL: str = Field(default="", description="AWS S3 Bucket URL (optional, auto-generated if not provided)")
    
    # Application Configuration
    ENV: str = Field(default="development", description="Environment (development/production)")
    DEBUG: bool = Field(default=True, description="Debug mode")
    AUTO_RELOAD: bool = Field(default=True, description="Enable auto-reload on file changes (development only)")
    BACKEND_URL: str = Field(default="", description="Backend base URL for links")
    PRODUCTION_URL: str = Field(default="https://ats-system-checker-backend-production.up.railway.app", description="Production base URL for links")
    MAX_FILE_SIZE: int = Field(default=16777216, description="Maximum file size in bytes (16MB)")
    ALLOWED_EXTENSIONS: str = Field(default="pdf,docx", description="Allowed file extensions")
    
    # Database Configuration - MongoDB
    MONGODB_URL: str = Field(default="", description="MongoDB connection URL")
    MONGODB_DATABASE: str = Field(default="ats_system", description="MongoDB database name")
    
    # Security Configuration
    SECRET_KEY: str = Field(
        default="",
        description="Secret key for signing JWT tokens"
    )
    JWT_ALGORITHM: str = Field(default="HS256", description="JWT signing algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, description="Access token expiration in minutes")
    REFRESH_TOKEN_EXPIRE_MINUTES: int = Field(default=43200, description="Refresh token expiration in minutes (30 days)")
    
    # API Documentation Authentication
    DOCS_USERNAME: str = Field(default="admin", description="Username for API documentation access")
    DOCS_PASSWORD: str = Field(default="admin123", description="Password for API documentation access")
    DOCS_AUTH_ENABLED: bool = Field(default=True, description="Enable authentication for API documentation")
    
    # CORS Configuration
    CORS_ALLOW_ORIGINS: str = Field(
        default="",
        description="CORS allowed origins (comma-separated)"
    )
    CORS_ALLOW_CREDENTIALS: bool = Field(default=True, description="Allow credentials with CORS")
    
    # Extended CORS Configuration
    CORS_ORIGIN: str = Field(default="", description="CORS origin")
    CORS_METHODS: str = Field(default="GET,POST,PUT,DELETE,OPTIONS", description="CORS methods")
    CORS_ALLOWED_HEADERS: str = Field(default="Content-Type,Authorization,X-Requested-With,X-CSRF-Token", description="CORS allowed headers")
    CORS_EXPOSED_HEADERS: str = Field(default="X-CSRF-Token", description="CORS exposed headers")
    CORS_MAX_AGE: int = Field(default=86400, description="CORS max age")
    CORS_WHITELIST: str = Field(default="", description="CORS whitelist")
    CORS_BLACKLIST: str = Field(default="", description="CORS blacklist")
    CORS_SECURITY_HEADERS: bool = Field(default=True, description="CORS security headers")
    
    # Rate Limiting and Security Headers
    RATE_LIMIT: str = Field(default="100/minute", description="Rate limiting (requests per minute)")
    FORCE_HTTPS: bool = Field(default=True, description="Force HTTPS in production")
    SESSION_COOKIE_SECURE: bool = Field(default=True, description="Secure session cookies")
    CSRF_COOKIE_SECURE: bool = Field(default=True, description="Secure CSRF cookies")
    
    # Extended Security Configuration
    SECURE_COOKIES: bool = Field(default=True, description="Secure cookies")
    
    # Extended Rate Limiting
    RATE_LIMIT_WINDOW_MS: int = Field(default=900000, description="Rate limit window in milliseconds")
    RATE_LIMIT_MAX_REQUESTS: int = Field(default=100, description="Max requests per window")
    GLOBAL_RATE_LIMIT_WINDOW_MS: int = Field(default=60000, description="Global rate limit window")
    GLOBAL_RATE_LIMIT_MAX_REQUESTS: int = Field(default=1000, description="Global max requests")
    STRICT_RATE_LIMIT_WINDOW_MS: int = Field(default=60000, description="Strict rate limit window")
    STRICT_RATE_LIMIT_MAX_REQUESTS: int = Field(default=10, description="Strict max requests")
    
    # DDoS Protection
    DDOS_LIMIT: int = Field(default=100, description="DDoS limit")
    DDOS_BURST: int = Field(default=50, description="DDoS burst")
    DDOS_WINDOW_MS: int = Field(default=60000, description="DDoS window")
    DDOS_BLACKLIST: str = Field(default="", description="DDoS blacklist")
    DDOS_WHITELIST: str = Field(default="", description="DDoS whitelist")
    DDOS_AUTO_BAN_COUNT: int = Field(default=5, description="DDoS auto ban count")
    DDOS_AUTO_BAN_TIME: int = Field(default=300000, description="DDoS auto ban time")
    
    # Trusted IPs
    TRUSTED_IPS: str = Field(default="127.0.0.1,::1", description="Trusted IP addresses")
    
    # File Storage
    UPLOAD_FOLDER: str = Field(default="uploads", description="Upload folder path")
    EVALUATIONS_FOLDER: str = Field(default="evaluations", description="Evaluations folder path")
    UPLOADS_BASE_URL: str = Field(default="", description="Base URL for uploads and CV files")
    
    # File Upload Security
    ALLOW_JOB_APPLICATION_UPLOADS: bool = Field(default=True, description="Allow file uploads for job applications")
    ALLOW_GENERAL_FILE_UPLOADS: bool = Field(default=False, description="Allow general file uploads (disabled for security)")
    
    # Quiz Configuration
    QUIZ_TIME_LIMIT: int = Field(default=300, description="Quiz time limit in seconds")
    QUIZ_PASS_THRESHOLD: int = Field(default=7, description="Minimum score to pass quiz")
    
    # API Configuration
    API_HOST: str = Field(default="0.0.0.0", description="API host")
    API_PORT: int = Field(default=4002, description="API port")
    
    # API Documentation URLs
    API_DOCUMENTATION: str = Field(default="", description="API documentation base URL")
    ALTERNATIVE_DOCS: str = Field(default="", description="Alternative documentation base URL")
    OPENAPI_SCHEMA: str = Field(default="", description="OpenAPI schema base URL")
    
    # Additional Ports & Hosts
    PORT: int = Field(default=4002, description="Port")
    API_GATEWAY_PORT: int = Field(default=4000, description="API Gateway port")
    SERVER_PORT: int = Field(default=4002, description="Server port")
    ATS_SYSTEM_PORT: int = Field(default=4002, description="ATS System port")
    AI_SERVICE_PORT: int = Field(default=5000, description="AI Service port")
    FRONTEND_PORT: int = Field(default=3000, description="Frontend port")
    
    # Frontend Configuration
    FRONTEND_ORIGIN: str = Field(default="", description="Frontend origin")
    NEXT_PUBLIC_API_URL: str = Field(default="", description="Next.js public API URL")
    NEXT_PUBLIC_API_JOBS: str = Field(default="", description="Next.js public API jobs URL")
    
    # Backend Service URLs
    SERVER_URL: str = Field(default="", description="Server URL")
    ATS_SYSTEM_URL: str = Field(default="", description="ATS System URL")
    API_BASE_URL: str = Field(default="", description="API base URL")
    API_AUTH_URL: str = Field(default="", description="API auth URL")
    API_GATEWAY_BASE_URL: str = Field(default="", description="API Gateway base URL")
    
    # Redis Configuration
    UPSTASH_REDIS_REST_URL: str = Field(default="", description="Upstash Redis REST URL")
    UPSTASH_REDIS_REST_TOKEN: str = Field(default="", description="Upstash Redis REST token")
    
    # JWT Configuration
    JWT_SECRET: str = Field(default="", description="JWT secret")
    JWT_EXPIRES_IN: str = Field(default="30m", description="JWT expiration")
    JWT_REFRESH_SECRET: str = Field(default="", description="JWT refresh secret")
    JWT_REFRESH_EXPIRES_IN: str = Field(default="30d", description="JWT refresh expiration")
    
    # Email Configuration (Extended)
    EMAIL_HOST: str = Field(default="smtp.gmail.com", description="Email host")
    EMAIL_PORT: int = Field(default=465, description="Email port")
    EMAIL_SECURE: bool = Field(default=True, description="Email secure")
    EMAIL_FROM: str = Field(default="", description="Email from address")
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")
    LOG_FILE: str = Field(default="ats_system.log", description="Log file path")
    
    AI_SERVICE_URL: str = Field(
        default="",
        description="Base URL for the AI microservice")
    
    # AI Service Configuration
    AI_SERVICE_ENABLED: bool = Field(default=True, description="Enable AI service integration")
    AI_SERVICE_FALLBACK: bool = Field(default=True, description="Enable fallback processing when AI service is unavailable")
    
    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables
    
    @validator('BACKEND_URL', 'MONGODB_URL', 'UPLOADS_BASE_URL', 'AI_SERVICE_URL', 'API_DOCUMENTATION', 'ALTERNATIVE_DOCS', 'OPENAPI_SCHEMA', 'API_GATEWAY_BASE_URL', pre=True)
    def validate_urls(cls, v):
        """Validate and set default URLs based on environment"""
        if not v:
            if os.getenv('ENV') == 'development':
                if 'BACKEND_URL' in cls.__fields__:
                    return "http://localhost:4002"
                elif 'MONGODB_URL' in cls.__fields__:
                    return "mongodb://localhost:27017"
                elif 'UPLOADS_BASE_URL' in cls.__fields__:
                    return "http://localhost:4002"
                elif 'AI_SERVICE_URL' in cls.__fields__:
                    # Prefer IPv4 loopback to avoid IPv6 localhost issues on some systems
                    return "http://127.0.0.1:5000"
                elif 'API_DOCUMENTATION' in cls.__fields__:
                    return "http://localhost:4002"
                elif 'ALTERNATIVE_DOCS' in cls.__fields__:
                    return "http://localhost:4002"
                elif 'OPENAPI_SCHEMA' in cls.__fields__:
                    return "http://localhost:4002"
                elif 'API_GATEWAY_BASE_URL' in cls.__fields__:
                    return "http://localhost:4000"
            else:
                # Production defaults - these should be set in .env
                return ""
        return v
    
    @validator('SECRET_KEY', pre=True)
    def validate_secret_key(cls, v):
        """Ensure secret key is set in production"""
        if not v and os.getenv('ENV') == 'production':
            raise ValueError("SECRET_KEY must be set in production environment")
        return v or "your-super-secret-key-here-change-in-production"
    
    @property
    def allowed_extensions_set(self) -> Set[str]:
        """Get allowed extensions as a set"""
        return set(ext.strip().lower() for ext in self.ALLOWED_EXTENSIONS.split(','))
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.ENV.lower() == "development"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode"""
        # Check explicit environment setting
        if self.ENV.lower() == "production":
            return True
        
        # Check if running on Railway (production)
        if "railway" in os.getenv("HOSTNAME", "").lower():
            return True
        
        # Check if running on Heroku
        if os.getenv("DYNO"):
            return True
        
        # Check if running on AWS
        if os.getenv("AWS_EXECUTION_ENV"):
            return True
        
        # Check if running on Google Cloud
        if os.getenv("GOOGLE_CLOUD_PROJECT"):
            return True
        
        # Check if running on Azure
        if os.getenv("WEBSITE_SITE_NAME"):
            return True
        
        # Check if DEBUG is explicitly set to False
        if self.DEBUG is False:
            return True
        
        return False
    
    @property
    def s3_bucket_url(self) -> str:
        """Get S3 bucket URL, auto-generate if not provided"""
        if self.AWS_S3_BUCKET_URL:
            return self.AWS_S3_BUCKET_URL.rstrip('/')
        elif self.AWS_S3_BUCKET:
            return f"https://{self.AWS_S3_BUCKET}.s3.{self.AWS_REGION}.amazonaws.com"
        else:
            return ""
    
    @property
    def api_documentation_url(self) -> str:
        """Get API documentation URL based on current host and port"""
        host = "localhost" if self.API_HOST == "0.0.0.0" else self.API_HOST
        return f"http://{host}:{self.API_PORT}"
    
    @property
    def alternative_docs_url(self) -> str:
        """Get alternative documentation URL based on current host and port"""
        host = "localhost" if self.API_HOST == "0.0.0.0" else self.API_HOST
        return f"http://{host}:{self.API_PORT}"
    
    @property
    def openapi_schema_url(self) -> str:
        """Get OpenAPI schema URL based on current host and port"""
        host = "localhost" if self.API_HOST == "0.0.0.0" else self.API_HOST
        return f"http://{host}:{self.API_PORT}"
    
    def get_cors_origins(self) -> list:
        """Get CORS allowed origins from environment variables"""
        origins = []
        
        # Use CORS_ALLOW_ORIGINS if configured
        if self.CORS_ALLOW_ORIGINS:
            origins = [origin.strip() for origin in self.CORS_ALLOW_ORIGINS.split(",")]
        
        # Use CORS_ORIGIN if configured
        if self.CORS_ORIGIN and self.CORS_ORIGIN not in origins:
            origins.append(self.CORS_ORIGIN.rstrip("/"))
        
        # Add frontend URL if not already included
        if self.FRONTEND_ORIGIN and self.FRONTEND_ORIGIN not in origins:
            origins.append(self.FRONTEND_ORIGIN.rstrip("/"))
        
        # Add development origins if in development mode
        if self.is_development:
            dev_origins = [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:4002",
                "http://127.0.0.1:4002",
                "http://localhost:4000",
                "http://127.0.0.1:4000",
                "http://localhost:4001",
                "http://127.0.0.1:4001"
            ]
            for origin in dev_origins:
                if origin not in origins:
                    origins.append(origin)
        
        return origins
    
    def get_backend_url(self) -> str:
        """Get backend URL from environment variables"""
        if self.BACKEND_URL and self.BACKEND_URL.strip():
            # Clean the BACKEND_URL to remove any trailing commas or malformed values
            clean_url = self.BACKEND_URL.strip().rstrip(',').rstrip('/')
            if clean_url and not clean_url.endswith(','):
                return clean_url
        
        # Environment-specific fallbacks
        if self.is_development:
            return "http://localhost:4002"
        else:
            # Production fallback - use PRODUCTION_URL if set, otherwise default
            return self.PRODUCTION_URL or "https://ats-system-checker-backend-production.up.railway.app"
    
    def get_uploads_url(self) -> str:
        """Get uploads URL from environment variables"""
        if self.UPLOADS_BASE_URL and self.UPLOADS_BASE_URL.strip():
            # Clean the UPLOADS_BASE_URL to remove any trailing commas or malformed values
            clean_url = self.UPLOADS_BASE_URL.strip().rstrip(',').rstrip('/')
            if clean_url and not clean_url.endswith(','):
                return clean_url
        
        # Environment-specific fallbacks
        if self.is_development:
            return "http://localhost:4002"
        else:
            # Production fallback - use PRODUCTION_URL if set, otherwise default
            return self.PRODUCTION_URL or "https://ats-system-checker-backend-production.up.railway.app"
    
    @property
    def security_headers_enabled(self) -> bool:
        """Check if security headers should be enabled"""
        return self.is_production or self.FORCE_HTTPS
    
    @property
    def secure_cookies_enabled(self) -> bool:
        """Check if secure cookies should be enabled"""
        return self.is_production or (self.SESSION_COOKIE_SECURE and self.CSRF_COOKIE_SECURE)
    
    @property
    def trusted_ips_set(self) -> Set[str]:
        """Get trusted IPs as a set"""
        if not self.TRUSTED_IPS:
            return {"127.0.0.1", "::1"}
        return set(ip.strip() for ip in self.TRUSTED_IPS.split(","))
    
    @property
    def cors_whitelist_set(self) -> Set[str]:
        """Get CORS whitelist as a set"""
        if not self.CORS_WHITELIST:
            return set()
        return set(origin.strip() for origin in self.CORS_WHITELIST.split(","))
    
    @property
    def cors_blacklist_set(self) -> Set[str]:
        """Get CORS blacklist as a set"""
        if not self.CORS_BLACKLIST:
            return set()
        return set(origin.strip() for origin in self.CORS_BLACKLIST.split(","))
    
    @property
    def ddos_whitelist_set(self) -> Set[str]:
        """Get DDoS whitelist as a set"""
        if not self.DDOS_WHITELIST:
            return set()
        return set(ip.strip() for ip in self.DDOS_WHITELIST.split(","))
    
    @property
    def ddos_blacklist_set(self) -> Set[str]:
        """Get DDoS blacklist as a set"""
        if not self.DDOS_BLACKLIST:
            return set()
        return set(ip.strip() for ip in self.DDOS_BLACKLIST.split(","))

    def get_environment_info(self) -> dict:
        """Get detailed environment information for debugging"""
        return {
            "ENV": self.ENV,
            "DEBUG": self.DEBUG,
            "is_development": self.is_development,
            "is_production": self.is_production,
            "BACKEND_URL": self.BACKEND_URL,
            "PRODUCTION_URL": self.PRODUCTION_URL,
            "UPLOADS_BASE_URL": self.UPLOADS_BASE_URL,
            "HOSTNAME": os.getenv("HOSTNAME", "unknown"),
            "RAILWAY_ENVIRONMENT": os.getenv("RAILWAY_ENVIRONMENT", "not_set"),
            "HEROKU_APP_NAME": os.getenv("HEROKU_APP_NAME", "not_set"),
            "AWS_EXECUTION_ENV": os.getenv("AWS_EXECUTION_ENV", "not_set"),
            "GOOGLE_CLOUD_PROJECT": os.getenv("GOOGLE_CLOUD_PROJECT", "not_set"),
            "WEBSITE_SITE_NAME": os.getenv("WEBSITE_SITE_NAME", "not_set"),
            "computed_frontend_url": self.get_backend_url(),
            "computed_uploads_url": self.get_uploads_url()
        }


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance
    
    Returns:
        Settings: Application settings
    """
    return Settings() 