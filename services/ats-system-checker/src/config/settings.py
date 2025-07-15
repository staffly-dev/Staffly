"""
Settings configuration for ATS System Backend
Uses Pydantic for environment variable validation and management
"""

import os
from functools import lru_cache
from typing import Set
from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # AI/API Configuration
    COHERE_API_KEY: str = Field(..., description="Cohere API key for AI services")
    
    # Email Configuration
    GMAIL_USER: str = Field(default="your_email@gmail.com", description="Gmail user for notifications")
    GMAIL_PASSWORD: str = Field(default="", description="Gmail app password")
    
    # Application Configuration
    ENV: str = Field(default="development", description="Environment (development/production)")
    DEBUG: bool = Field(default=True, description="Debug mode")
    FRONTEND_URL: str = Field(default="http://localhost:3000", description="Frontend base URL for links")
    MAX_FILE_SIZE: int = Field(default=16777216, description="Maximum file size in bytes (16MB)")
    ALLOWED_EXTENSIONS: str = Field(default="pdf,docx", description="Allowed file extensions")
    
    # Database Configuration - MongoDB
    MONGODB_URL: str = Field(default="mongodb://localhost:27017", description="MongoDB connection URL")
    MONGODB_DATABASE: str = Field(default="ats_system", description="MongoDB database name")
    
    # Security Configuration
    SECRET_KEY: str = Field(
        default="your-super-secret-key-here-change-in-production",
        description="Secret key for signing JWT tokens"
    )
    JWT_ALGORITHM: str = Field(default="HS256", description="JWT signing algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, description="Access token expiration in minutes")
    REFRESH_TOKEN_EXPIRE_MINUTES: int = Field(default=43200, description="Refresh token expiration in minutes (30 days)")
    
    # CORS Configuration
    CORS_ALLOW_ORIGINS: str = Field(
        default="http://localhost:3000,https://your-production-frontend.com",
        description="CORS allowed origins (comma-separated)"
    )
    CORS_ALLOW_CREDENTIALS: bool = Field(default=True, description="Allow credentials with CORS")
    
    # Rate Limiting and Security Headers
    RATE_LIMIT: str = Field(default="100/minute", description="Rate limiting (requests per minute)")
    FORCE_HTTPS: bool = Field(default=True, description="Force HTTPS in production")
    SESSION_COOKIE_SECURE: bool = Field(default=True, description="Secure session cookies")
    CSRF_COOKIE_SECURE: bool = Field(default=True, description="Secure CSRF cookies")
    
    # File Storage
    UPLOAD_FOLDER: str = Field(default="uploads", description="Upload folder path")
    EVALUATIONS_FOLDER: str = Field(default="evaluations", description="Evaluations folder path")
    
    # Quiz Configuration
    QUIZ_TIME_LIMIT: int = Field(default=300, description="Quiz time limit in seconds")
    QUIZ_PASS_THRESHOLD: int = Field(default=7, description="Minimum score to pass quiz")
    
    # API Configuration
    API_HOST: str = Field(default="0.0.0.0", description="API host")
    API_PORT: int = Field(default=4000, description="API port")
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")
    LOG_FILE: str = Field(default="ats_system.log", description="Log file path")
    
    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "..", "..", ".env")
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables
    
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
        return self.ENV.lower() == "production"
    
    def get_cors_origins(self) -> list:
        """Get CORS allowed origins"""
        # Use CORS_ALLOW_ORIGINS if configured, otherwise use defaults
        if self.CORS_ALLOW_ORIGINS and self.CORS_ALLOW_ORIGINS != "http://localhost:3000,https://your-production-frontend.com":
            origins = [origin.strip() for origin in self.CORS_ALLOW_ORIGINS.split(",")]
        else:
            origins = []
            if self.FRONTEND_URL:
                origins.append(self.FRONTEND_URL.rstrip("/"))  # Remove trailing slash
            if self.is_development:
                origins.extend([
                    "http://localhost:3000",
                    "http://127.0.0.1:3000",
                    "http://localhost:4000",
                    "http://127.0.0.1:4000"
                ])
        return origins
    
    @property
    def security_headers_enabled(self) -> bool:
        """Check if security headers should be enabled"""
        return self.is_production or self.FORCE_HTTPS
    
    @property
    def secure_cookies_enabled(self) -> bool:
        """Check if secure cookies should be enabled"""
        return self.is_production or (self.SESSION_COOKIE_SECURE and self.CSRF_COOKIE_SECURE)


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance
    
    Returns:
        Settings: Application settings
    """
    return Settings() 