"""
Enhanced Security Middleware for ATS System
Comprehensive security measures including XSS, CSRF, SQL injection, and SSRF protection
"""

import re
import secrets
import base64
import hashlib
import hmac
from typing import Optional, Set
from urllib.parse import urlparse, parse_qs
from fastapi import Request, Response, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import ipaddress

from ..utils.logging_config import get_logger
from ..config.settings import get_settings

logger = get_logger(__name__)
settings = get_settings()


class EnhancedSecurityMiddleware(BaseHTTPMiddleware):
    """Comprehensive security middleware combining all security measures"""
    
    def __init__(self, app):
        super().__init__(app)
        self.security = HTTPBasic()
        
        # Initialize security patterns
        self._init_security_patterns()
        
        # Rate limiting storage (in production, use Redis)
        self._request_counts = {}
        self._ip_blacklist = set()
        
    def _init_security_patterns(self):
        """Initialize security detection patterns"""
        # SQL Injection patterns
        self.sql_patterns = [
            r"(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)",
            r"(\b(and|or)\s+\d+\s*[=<>]\s*\d+)",
            r"(\b(union|select)\s+.*\bfrom\b)",
            r"(\bxp_cmdshell\b)",
            r"(\bwaitfor\s+delay\b)",
            r"(\bchar\s*\(\s*\d+\s*\))",
            r"(\bcast\s*\(\s*\w+\s+as\s+\w+\s*\))",
            r"(\bconvert\s*\(\s*\w+\s*,\s*\w+\s*\))",
            r"(\bdeclare\s+\w+\s+\w+\b)",
            r"(\bexec\s*\(\s*@\w+\b)",
        ]
        
        # XSS patterns
        self.xss_patterns = [
            r"<script[^>]*>.*?</script>",
            r"javascript:",
            r"vbscript:",
            r"onload\s*=",
            r"onerror\s*=",
            r"onclick\s*=",
            r"onmouseover\s*=",
            r"<iframe[^>]*>",
            r"<object[^>]*>",
            r"<embed[^>]*>",
            r"<form[^>]*>",
            r"<input[^>]*>",
            r"<textarea[^>]*>",
            r"<select[^>]*>",
            r"<button[^>]*>",
            r"<link[^>]*>",
            r"<meta[^>]*>",
            r"<style[^>]*>",
            r"<base[^>]*>",
            r"<bgsound[^>]*>",
            r"<link[^>]*>",
            r"<meta[^>]*>",
            r"<title[^>]*>",
            r"<xmp[^>]*>",
            r"<plaintext[^>]*>",
            r"<listing[^>]*>",
            r"<marquee[^>]*>",
            r"<applet[^>]*>",
            r"<isindex[^>]*>",
            r"<keygen[^>]*>",
            r"<command[^>]*>",
            r"<menu[^>]*>",
            r"<menuitem[^>]*>",
            r"<source[^>]*>",
            r"<track[^>]*>",
            r"<video[^>]*>",
            r"<audio[^>]*>",
            r"<canvas[^>]*>",
            r"<svg[^>]*>",
            r"<math[^>]*>",
            r"<details[^>]*>",
            r"<dialog[^>]*>",
            r"<summary[^>]*>",
            r"<data[^>]*>",
            r"<time[^>]*>",
            r"<mark[^>]*>",
            r"<ruby[^>]*>",
            r"<rt[^>]*>",
            r"<rp[^>]*>",
            r"<bdi[^>]*>",
            r"<bdo[^>]*>",
            r"<wbr[^>]*>",
            r"<picture[^>]*>",
            r"<figure[^>]*>",
            r"<figcaption[^>]*>",
            r"<main[^>]*>",
            r"<article[^>]*>",
            r"<section[^>]*>",
            r"<nav[^>]*>",
            r"<aside[^>]*>",
            r"<header[^>]*>",
            r"<footer[^>]*>",
            r"<address[^>]*>",
            r"<blockquote[^>]*>",
            r"<dd[^>]*>",
            r"<dl[^>]*>",
            r"<dt[^>]*>",
            r"<fieldset[^>]*>",
            r"<legend[^>]*>",
            r"<optgroup[^>]*>",
            r"<option[^>]*>",
            r"<datalist[^>]*>",
            r"<output[^>]*>",
            r"<progress[^>]*>",
            r"<meter[^>]*>",
            r"<details[^>]*>",
            r"<dialog[^>]*>",
            r"<summary[^>]*>",
            r"<data[^>]*>",
            r"<time[^>]*>",
            r"<mark[^>]*>",
            r"<ruby[^>]*>",
            r"<rt[^>]*>",
            r"<rp[^>]*>",
            r"<bdi[^>]*>",
            r"<bdo[^>]*>",
            r"<wbr[^>]*>",
            r"<picture[^>]*>",
            r"<figure[^>]*>",
            r"<figcaption[^>]*>",
            r"<main[^>]*>",
            r"<article[^>]*>",
            r"<section[^>]*>",
            r"<nav[^>]*>",
            r"<aside[^>]*>",
            r"<header[^>]*>",
            r"<footer[^>]*>",
            r"<address[^>]*>",
            r"<blockquote[^>]*>",
            r"<dd[^>]*>",
            r"<dl[^>]*>",
            r"<dt[^>]*>",
            r"<fieldset[^>]*>",
            r"<legend[^>]*>",
            r"<optgroup[^>]*>",
            r"<option[^>]*>",
            r"<datalist[^>]*>",
            r"<output[^>]*>",
            r"<progress[^>]*>",
            r"<meter[^>]*>",
        ]
        
        # SSRF patterns
        self.ssrf_patterns = [
            r"file://",
            r"ftp://",
            r"gopher://",
            r"dict://",
            r"ldap://",
            r"tftp://",
            r"telnet://",
            r"ssh://",
            r"scp://",
            r"sftp://",
            r"rsync://",
            r"git://",
            r"svn://",
            r"cvs://",
            r"bzr://",
            r"hg://",
            r"p4://",
            r"svn+ssh://",
            r"git+ssh://",
            r"bzr+ssh://",
            r"hg+ssh://",
            r"p4+ssh://",
        ]
        
        # Path traversal patterns
        self.path_traversal_patterns = [
            r"\.\./",
            r"\.\.\\",
            r"\.\.%2f",
            r"\.\.%5c",
            r"\.\.%2e%2e%2f",
            r"\.\.%2e%2e%5c",
            r"\.\.%252e%252e%252f",
            r"\.\.%252e%252e%255c",
            r"\.\.%c0%af",
            r"\.\.%c1%9c",
            r"\.\.%c0%2e%c0%2e%c0%af",
            r"\.\.%c1%2e%c1%2e%c1%9c",
        ]
        
        # Compile patterns for efficiency
        self.sql_regex = re.compile("|".join(self.sql_patterns), re.IGNORECASE)
        self.xss_regex = re.compile("|".join(self.xss_patterns), re.IGNORECASE)
        self.ssrf_regex = re.compile("|".join(self.ssrf_patterns), re.IGNORECASE)
        self.path_traversal_regex = re.compile("|".join(self.path_traversal_patterns), re.IGNORECASE)
        
        # Additional security patterns
        self.no_sql_patterns = [
            r"(\$where\b)",
            r"(\$ne\b)",
            r"(\$gt\b)",
            r"(\$lt\b)",
            r"(\$gte\b)",
            r"(\$lte\b)",
            r"(\$in\b)",
            r"(\$nin\b)",
            r"(\$exists\b)",
            r"(\$regex\b)",
            r"(\$text\b)",
            r"(\$search\b)",
            r"(\$language\b)",
            r"(\$caseSensitive\b)",
            r"(\$diacriticSensitive\b)",
        ]
        self.no_sql_regex = re.compile("|".join(self.no_sql_patterns), re.IGNORECASE)
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Apply comprehensive security checks
        
        Args:
            request: FastAPI request object
            call_next: Next middleware/endpoint in chain
            
        Returns:
            Response: HTTP response
        """
        try:
            # Get client IP
            client_ip = self._get_client_ip(request)
            
            # Check if IP is blacklisted
            if client_ip in self._ip_blacklist:
                logger.warning(f"Blocked request from blacklisted IP: {client_ip}")
                return JSONResponse(
                    status_code=status.HTTP_403_FORBIDDEN,
                    content={"error": "Access denied", "code": "IP_BLACKLISTED"}
                )
            
            # Rate limiting check
            if not self._check_rate_limit(client_ip):
                logger.warning(f"Rate limit exceeded for IP: {client_ip}")
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"error": "Rate limit exceeded", "code": "RATE_LIMIT_EXCEEDED"}
                )
            
            # Security checks
            security_check = await self._perform_security_checks(request)
            if security_check:
                return security_check
            
            # Continue with request
            response = await call_next(request)
            
            # Add security headers
            response = self._add_security_headers(response, request)
            
            # Add timing protection
            self._add_timing_protection(response)
            
            return response
            
        except Exception as e:
            logger.error(f"Security middleware error: {e}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"error": "Internal server error", "code": "SECURITY_ERROR"}
            )
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address"""
        # Check for forwarded headers
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        # Fallback to client host
        if request.client:
            return request.client.host
        
        return "unknown"
    
    def _check_rate_limit(self, client_ip: str) -> bool:
        """Enhanced rate limiting with multiple windows and automatic blacklisting"""
        import time
        current_time = time.time()
        
        # Initialize client tracking
        if client_ip not in self._request_counts:
            self._request_counts[client_ip] = {
                "short_window": {"count": 1, "start": current_time},
                "medium_window": {"count": 1, "start": current_time},
                "long_window": {"count": 1, "start": current_time},
                "violations": 0
            }
            return True
        
        client_data = self._request_counts[client_ip]
        
        # Short window (10 seconds, max 20 requests)
        if current_time - client_data["short_window"]["start"] > 10:
            client_data["short_window"] = {"count": 1, "start": current_time}
        elif client_data["short_window"]["count"] >= 20:
            client_data["violations"] += 1
            return False
        else:
            client_data["short_window"]["count"] += 1
        
        # Medium window (1 minute, max 100 requests)
        if current_time - client_data["medium_window"]["start"] > 60:
            client_data["medium_window"] = {"count": 1, "start": current_time}
        elif client_data["medium_window"]["count"] >= 100:
            client_data["violations"] += 1
            return False
        else:
            client_data["medium_window"]["count"] += 1
        
        # Long window (5 minutes, max 500 requests)
        if current_time - client_data["long_window"]["start"] > 300:
            client_data["long_window"] = {"count": 1, "start": current_time}
        elif client_data["long_window"]["count"] >= 500:
            client_data["violations"] += 1
            return False
        else:
            client_data["long_window"]["count"] += 1
        
        # Auto-blacklist after multiple violations
        if client_data["violations"] >= 3:
            self._ip_blacklist.add(client_ip)
            logger.warning(f"IP {client_ip} auto-blacklisted after {client_data['violations']} violations")
            return False
        
        # Clean up old data periodically
        if current_time % 300 == 0:  # Every 5 minutes
            self._cleanup_old_data(current_time)
        
        return True
    
    def _cleanup_old_data(self, current_time: float):
        """Clean up old rate limiting data to prevent memory issues"""
        cutoff_time = current_time - 600  # 10 minutes ago
        
        # Clean up old client data
        expired_clients = []
        for client_ip, client_data in self._request_counts.items():
            if (current_time - client_data["long_window"]["start"] > cutoff_time and
                current_time - client_data["medium_window"]["start"] > cutoff_time and
                current_time - client_data["short_window"]["start"] > cutoff_time):
                expired_clients.append(client_ip)
        
        for client_ip in expired_clients:
            del self._request_counts[client_ip]
        
        # Clean up old blacklisted IPs (allow retry after 1 hour)
        expired_blacklist = set()
        for client_ip in self._ip_blacklist:
            # For now, we'll keep blacklist persistent
            # In production, you might want to implement time-based blacklisting
            pass
        
        if expired_blacklist:
            self._ip_blacklist -= expired_blacklist
    
    async def _perform_security_checks(self, request: Request) -> Optional[Response]:
        """Perform all security checks"""
        
        # Check request method
        if request.method not in ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]:
            logger.warning(f"Invalid HTTP method: {request.method}")
            return JSONResponse(
                status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
                content={"error": "Method not allowed", "code": "INVALID_METHOD"}
            )
        
        # Check for suspicious user agents
        user_agent = request.headers.get("user-agent", "")
        if self._is_suspicious_user_agent(user_agent):
            logger.warning(f"Suspicious user agent detected: {user_agent}")
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"error": "Access denied", "code": "SUSPICIOUS_USER_AGENT"}
            )
        
        # Check for suspicious request patterns
        if self._is_suspicious_request(request):
            logger.warning(f"Suspicious request pattern detected from {self._get_client_ip(request)}")
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"error": "Access denied", "code": "SUSPICIOUS_REQUEST_PATTERN"}
            )
        
        # Check URL for malicious patterns
        url_check = self._check_url_security(str(request.url))
        if url_check:
            return url_check
        
        # Check query parameters
        query_check = self._check_query_params(request.query_params)
        if query_check:
            return query_check
        
        # Check headers
        header_check = self._check_headers(request.headers)
        if header_check:
            return header_check
        
        # Check body for POST/PUT requests
        if request.method in ["POST", "PUT", "PATCH"]:
            # CSRF token validation
            csrf_check = self._validate_csrf_token(request)
            if csrf_check:
                return csrf_check
            
            body_check = await self._check_request_body(request)
            if body_check:
                return body_check
        
        return None
    
    def _check_url_security(self, url: str) -> Optional[Response]:
        """Check URL for security threats"""
        
        # Check for path traversal
        if self.path_traversal_regex.search(url):
            logger.warning(f"Path traversal attempt detected: {url}")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"error": "Invalid URL", "code": "PATH_TRAVERSAL_DETECTED"}
            )
        
        # Check for SSRF patterns
        if self.ssrf_regex.search(url):
            logger.warning(f"SSRF attempt detected: {url}")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"error": "Invalid URL", "code": "SSRF_DETECTED"}
            )
        
        return None
    
    def _check_query_params(self, query_params) -> Optional[Response]:
        """Check query parameters for security threats"""
        
        for key, value in query_params.items():
            # Check for SQL injection
            if self.sql_regex.search(str(value)):
                logger.warning(f"SQL injection attempt detected in query param {key}: {value}")
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"error": "Invalid query parameter", "code": "SQL_INJECTION_DETECTED"}
                )
            
            # Check for XSS
            if self.xss_regex.search(str(value)):
                logger.warning(f"XSS attempt detected in query param {key}: {value}")
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"error": "Invalid query parameter", "code": "XSS_DETECTED"}
                )
        
        return None
    
    def _check_headers(self, headers) -> Optional[Response]:
        """Check headers for security threats"""
        
        for key, value in headers.items():
            # Check for header injection
            if "\n" in str(value) or "\r" in str(value):
                logger.warning(f"Header injection attempt detected: {key}: {value}")
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"error": "Invalid header", "code": "HEADER_INJECTION_DETECTED"}
                )
            
            # Check for XSS in headers
            if self.xss_regex.search(str(value)):
                logger.warning(f"XSS attempt detected in header {key}: {value}")
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={"error": "Invalid header", "code": "XSS_DETECTED"}
                )
        
        return None
    
    async def _check_request_body(self, request: Request) -> Optional[Response]:
        """Check request body for security threats"""
        
        try:
            # Skip body inspection for our API namespace to avoid consuming the stream
            # which can interfere with downstream parsing (e.g., Form() in FastAPI routes)
            path = str(request.url.path)
            if path.startswith("/ats-checker/"):
                return None
            
            # Get content type
            content_type = request.headers.get("content-type", "")
            
            if "application/json" in content_type:
                # For JSON requests, we'll check after parsing
                # This is a limitation - we can't check before parsing
                pass
            elif "application/x-www-form-urlencoded" in content_type:
                # Check form data
                form_data = await request.form()
                for key, value in form_data.items():
                    if isinstance(value, str):
                        check_result = self._check_string_security(value)
                        if check_result:
                            return check_result
            elif "multipart/form-data" in content_type:
                # Check multipart form data
                form_data = await request.form()
                for key, value in form_data.items():
                    if isinstance(value, str):
                        check_result = self._check_string_security(value)
                        if check_result:
                            return check_result
            
        except Exception as e:
            logger.error(f"Error checking request body: {e}")
            # Don't block the request if we can't check it
        
        return None
    
    def _check_string_security(self, value: str) -> Optional[Response]:
        """Check a string value for security threats"""
        
        # Check for SQL injection
        if self.sql_regex.search(value):
            logger.warning(f"SQL injection attempt detected: {value}")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"error": "Invalid input", "code": "SQL_INJECTION_DETECTED"}
            )
        
        # Check for NoSQL injection
        if self.no_sql_regex.search(value):
            logger.warning(f"NoSQL injection attempt detected: {value}")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"error": "Invalid input", "code": "NOSQL_INJECTION_DETECTED"}
            )
        
        # Check for XSS
        if self.xss_regex.search(value):
            logger.warning(f"XSS attempt detected: {value}")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"error": "Invalid input", "code": "XSS_DETECTED"}
            )
        
        # Check for SSRF attempts
        if self.ssrf_regex.search(value):
            logger.warning(f"SSRF attempt detected: {value}")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"error": "Invalid input", "code": "SSRF_DETECTED"}
            )
        
        # Check for path traversal
        if self.path_traversal_regex.search(value):
            logger.warning(f"Path traversal attempt detected: {value}")
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"error": "Invalid input", "code": "PATH_TRAVERSAL_DETECTED"}
            )
        
        return None
    
    def _add_security_headers(self, response: Response, request: Request) -> Response:
        """Add comprehensive security headers"""
        
        # Basic security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
        
        # Server identification (minimal)
        response.headers["Server"] = "ATS-System"
        
        # Force HTTPS in production
        if settings.security_headers_enabled:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        
        # Additional security headers
        response.headers["X-Permitted-Cross-Domain-Policies"] = "none"
        response.headers["X-Download-Options"] = "noopen"
        response.headers["X-DNS-Prefetch-Control"] = "off"
        response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
        
        # Content Security Policy
        if not self._is_docs_endpoint(request):
            csp = self._get_csp_policy()
            response.headers["Content-Security-Policy"] = csp
        
        # CSRF protection
        if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
            csrf_token = self._generate_csrf_token()
            response.headers["X-CSRF-Token"] = csrf_token
            
            # Add CSRF validation header for non-GET requests
            if request.method != "GET":
                response.headers["X-CSRF-Required"] = "true"
        
        return response
    
    def _is_docs_endpoint(self, request: Request) -> bool:
        """Check if request is for documentation endpoints"""
        docs_endpoints = ["/docs", "/redoc", "/openapi.json"]
        return any(endpoint in str(request.url.path) for endpoint in docs_endpoints)
    
    def _get_csp_policy(self) -> str:
        """Get Content Security Policy based on environment"""
        if settings.is_development:
            return (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self' https:; "
                "connect-src 'self' https:; "
                "frame-ancestors 'none'; "
                "base-uri 'self'; "
                "form-action 'self'"
            )
        else:
            return (
                "default-src 'self'; "
                "script-src 'self'; "
                "style-src 'self'; "
                "img-src 'self' data: https:; "
                "font-src 'self' https:; "
                "connect-src 'self' https:; "
                "frame-ancestors 'none'; "
                "base-uri 'self'; "
                "form-action 'self'; "
                "upgrade-insecure-requests"
            )
    
    def _generate_csrf_token(self) -> str:
        """Generate CSRF token"""
        return secrets.token_urlsafe(32)
    
    def _validate_csrf_token(self, request: Request) -> Optional[Response]:
        """Validate CSRF token for non-GET requests"""
        # Skip CSRF validation for GET requests
        if request.method == "GET":
            return None
        
        # Skip CSRF validation for API endpoints (they use other auth methods)
        path = str(request.url.path)
        if path.startswith("/api/") or path.startswith("/health/") or path.startswith("/debug/") or path.startswith("/ats-checker/"):
            logger.debug(f"Skipping CSRF validation for API endpoint: {path}")
            return None
        
        # Skip CSRF validation for documentation endpoints
        if path in ["/docs", "/redoc", "/openapi.json"]:
            logger.debug(f"Skipping CSRF validation for docs endpoint: {path}")
            return None
        
        # Skip CSRF validation for upload endpoints (handled by FileUploadSecurityMiddleware)
        if path.startswith("/upload/"):
            logger.debug(f"Skipping CSRF validation for upload endpoint: {path}")
            return None
        
        # For web forms and other endpoints, require CSRF token
        # Get CSRF token from headers
        csrf_token = request.headers.get("X-CSRF-Token")
        if not csrf_token:
            logger.warning(f"Missing CSRF token for {request.method} request to {path}")
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"error": "CSRF token required", "code": "CSRF_TOKEN_MISSING"}
            )
        
        # Validate token format (basic check)
        if len(csrf_token) < 32:
            logger.warning(f"Invalid CSRF token format for {request.method} request to {path}")
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"error": "Invalid CSRF token", "code": "CSRF_TOKEN_INVALID"}
            )
        
        # In production, you would validate against stored tokens
        # For now, we'll just check the format
        logger.debug(f"CSRF token validated for {path}")
        return None
    
    def _is_suspicious_user_agent(self, user_agent: str) -> bool:
        """Check if user agent is suspicious"""
        suspicious_patterns = [
            r"bot", r"crawler", r"spider", r"scraper", r"curl", r"wget", r"python",
            r"java", r"perl", r"ruby", r"php", r"go", r"rust", r"scanner", r"probe",
            r"nmap", r"sqlmap", r"nikto", r"dirb", r"gobuster", r"ffuf", r"wfuzz"
        ]
        
        user_agent_lower = user_agent.lower()
        return any(re.search(pattern, user_agent_lower) for pattern in suspicious_patterns)
    
    def _is_suspicious_request(self, request: Request) -> bool:
        """Check for suspicious request patterns"""
        # Check for excessive headers
        if len(request.headers) > 50:
            return True
        
        # Check for suspicious header values
        suspicious_headers = ["x-forwarded-for", "x-real-ip", "x-forwarded-proto", "x-forwarded-host"]
        for header in suspicious_headers:
            if header in request.headers and len(str(request.headers[header])) > 100:
                return True
        
        # Check for suspicious content length
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > 10000000:  # 10MB limit
            return True
        
        # Check for suspicious accept headers
        accept = request.headers.get("accept", "")
        if len(accept) > 500:  # Suspiciously long accept header
            return True
        
        return False
    
    def _add_timing_protection(self, response: Response):
        """Add timing attack protection headers"""
        # Add random delay to prevent timing attacks
        import random
        import time
        
        # Small random delay (1-5ms)
        delay = random.uniform(0.001, 0.005)
        time.sleep(delay)
        
        # Add timing protection headers
        response.headers["X-Response-Time"] = str(delay)
        response.headers["X-Timing-Protection"] = "enabled"


class DocsAuthenticationMiddleware(BaseHTTPMiddleware):
    """Enhanced middleware for protecting API documentation endpoints"""
    
    def __init__(self, app):
        super().__init__(app)
        self.docs_endpoints = ["/docs", "/redoc", "/openapi.json"]
        self.security = HTTPBasic()
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Check authentication for docs endpoints with enhanced security
        
        Args:
            request: FastAPI request object
            call_next: Next middleware/endpoint in chain
            
        Returns:
            Response: HTTP response
        """
        # Check if this is a docs endpoint
        is_docs_endpoint = any(
            endpoint in str(request.url.path) for endpoint in self.docs_endpoints
        )
        
        if is_docs_endpoint and settings.DOCS_AUTH_ENABLED:
            # Log the authentication attempt
            logger.info(f"Authentication required for docs endpoint: {request.url.path}")
            
            # Extract credentials from Authorization header
            auth_header = request.headers.get("authorization")
            
            if not auth_header or not auth_header.startswith("Basic "):
                # Return 401 with WWW-Authenticate header
                logger.warning(f"Missing or invalid Authorization header for {request.url.path}")
                response = Response(
                    content="Authentication required for API documentation. Please provide valid credentials.",
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    media_type="text/plain"
                )
                response.headers["WWW-Authenticate"] = 'Basic realm="API Documentation"'
                response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
                response.headers["Pragma"] = "no-cache"
                response.headers["Expires"] = "0"
                return response
            
            try:
                # Decode credentials
                credentials = auth_header.replace("Basic ", "")
                decoded_credentials = base64.b64decode(credentials).decode("utf-8")
                username, password = decoded_credentials.split(":", 1)
                
                # Validate credentials
                if (username == settings.DOCS_USERNAME and 
                    password == settings.DOCS_PASSWORD):
                    logger.info(f"Successful authentication for docs endpoint: {request.url.path}")
                    return await call_next(request)
                else:
                    logger.warning(f"Invalid credentials for docs endpoint: {request.url.path}")
                    response = Response(
                        content="Invalid credentials. Please check your username and password.",
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        media_type="text/plain"
                    )
                    response.headers["WWW-Authenticate"] = 'Basic realm="API Documentation"'
                    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
                    return response
                    
            except Exception as e:
                logger.error(f"Error during authentication: {e}")
                response = Response(
                    content="Authentication error. Please try again.",
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    media_type="text/plain"
                )
                return response
        
        # For non-docs endpoints or when auth is disabled, proceed normally
        return await call_next(request)





class FileUploadSecurityMiddleware(BaseHTTPMiddleware):
    """Middleware to prevent file uploads while allowing regular form submissions"""
    
    def __init__(self, app):
        super().__init__(app)
        self.upload_endpoints = ["/api/jobs/", "/apply/", "/upload/", "/api/upload/"]
        self.blocked_extensions = {
            # Executable files
            '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar', '.msi',
            # Script files
            '.php', '.asp', '.aspx', '.jsp', '.py', '.pl', '.sh', '.bash', '.ps1',
            # Office files with macros
            '.docm', '.xlsm', '.pptm', '.dotm', '.xltm', '.potm',
            # Archive files that could contain malicious content
            '.zip', '.rar', '.7z', '.tar', '.gz', '.bz2',
            # Image files that could contain malicious code
            '.svg', '.xml', '.html', '.htm',
            # All file types (comprehensive blocking)
            '.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt', '.pages',
            '.xls', '.xlsx', '.csv', '.ods', '.numbers',
            '.ppt', '.pptx', '.key', '.odp',
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp'
        }
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """
        Block file uploads while allowing regular form submissions
        
        Args:
            request: FastAPI request object
            call_next: Next middleware/endpoint in chain
            
        Returns:
            Response: HTTP response
        """
        # Check if this is a file upload endpoint
        is_upload_endpoint = any(
            endpoint in str(request.url.path) for endpoint in self.upload_endpoints
        )
        
        # Block all file upload attempts at upload endpoints
        if is_upload_endpoint and request.method == "POST":
            client_ip = self._get_client_ip(request)
            logger.warning(f"File upload blocked from {client_ip} to {request.url.path}")
            
            return JSONResponse(
                status_code=403,
                content={
                    "success": False,
                    "error": True,
                    "message": "File uploads are not allowed for security reasons",
                    "code": "FILE_UPLOADS_DISABLED",
                    "details": "This system has disabled file uploads to prevent security vulnerabilities"
                }
            )
        
        # Check for multipart form data (could be regular forms or file uploads)
        content_type = request.headers.get("content-type", "")
        if "multipart/form-data" in content_type:
            # Check if this is actually a file upload by looking for file-related fields
            # Regular form submissions with Form() parameters are allowed
            # Only block if we detect actual file upload attempts
            
            # Check for file-related headers that indicate actual file uploads
            has_file_headers = any(header in request.headers for header in [
                "content-disposition", "x-file-name", "x-file-size"
            ])
            
            # Check if the request body contains file uploads (this is more complex)
            # For now, we'll allow multipart forms but log them for monitoring
            if has_file_headers:
                client_ip = self._get_client_ip(request)
                logger.warning(f"File upload headers detected from {client_ip} to {request.url.path}")
                
                return JSONResponse(
                    status_code=403,
                    content={
                        "success": False,
                        "error": True,
                        "message": "File uploads are not allowed for security reasons",
                        "code": "FILE_HEADERS_DISABLED",
                        "details": "This system has disabled file uploads to prevent security vulnerabilities"
                    }
                )
            
            # Allow multipart forms that don't have file upload indicators
            # This allows regular Form() parameters to work
            logger.debug(f"Allowing multipart form submission to {request.url.path}")
        
        response = await call_next(request)
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address"""
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip
        
        if request.client:
            return request.client.host
        
        return "unknown" 