import { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Env } from "../config/env.config";

// Security patterns
const SQL_PATTERNS = [
  /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/i,
  /(\b(and|or)\s+\d+\s*[=<>]\s*\d+)/i,
  /(\bxp_cmdshell\b)/i,
];

const XSS_PATTERNS = [
  /<script[^>]*>.*?<\/script>/i,
  /javascript:/i,
  /onload\s*=/i,
  /onerror\s*=/i,
  /onclick\s*=/i,
  /<iframe[^>]*>/i,
];

const SSRF_PATTERNS = [
  /file:\/\//i,
  /ftp:\/\//i,
  /gopher:\/\//i,
  /dict:\/\//i,
];

const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//,
  /\.\.\\/,
  /\.\.%2f/i,
  /\.\.%5c/i,
];

const NO_SQL_PATTERNS = [
  /(\$where\b)/i,
  /(\$ne\b)/i,
  /(\$gt\b)/i,
  /(\$regex\b)/i,
];

// Rate limiting storage (in production, use Redis)
const requestCounts: Record<string, {
  short_window: { count: number; start: number };
  medium_window: { count: number; start: number };
  long_window: { count: number; start: number };
  violations: number;
}> = {};

const ipBlacklist = new Set<string>();

function getClientIp(req: Request): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    return Array.isArray(forwardedFor) ? forwardedFor[0].split(",")[0].trim() : forwardedFor.split(",")[0].trim();
  }

  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  return req.ip || req.socket.remoteAddress || "unknown";
}

function checkRateLimit(clientIp: string): boolean {
  const currentTime = Date.now();

  if (!requestCounts[clientIp]) {
    requestCounts[clientIp] = {
      short_window: { count: 1, start: currentTime },
      medium_window: { count: 1, start: currentTime },
      long_window: { count: 1, start: currentTime },
      violations: 0
    };
    return true;
  }

  const clientData = requestCounts[clientIp];

  // Short window (10 seconds, max 20 requests)
  if (currentTime - clientData.short_window.start > 10000) {
    clientData.short_window = { count: 1, start: currentTime };
  } else if (clientData.short_window.count >= 20) {
    clientData.violations++;
    return false;
  } else {
    clientData.short_window.count++;
  }

  // Medium window (1 minute, max 100 requests)
  if (currentTime - clientData.medium_window.start > 60000) {
    clientData.medium_window = { count: 1, start: currentTime };
  } else if (clientData.medium_window.count >= 100) {
    clientData.violations++;
    return false;
  } else {
    clientData.medium_window.count++;
  }

  // Long window (5 minutes, max 500 requests)
  if (currentTime - clientData.long_window.start > 300000) {
    clientData.long_window = { count: 1, start: currentTime };
  } else if (clientData.long_window.count >= 500) {
    clientData.violations++;
    return false;
  } else {
    clientData.long_window.count++;
  }

  // Auto-blacklist after multiple violations
  if (clientData.violations >= 3) {
    ipBlacklist.add(clientIp);
    console.warn(`IP ${clientIp} auto-blacklisted after ${clientData.violations} violations`);
    return false;
  }

  return true;
}

function checkStringSecurity(value: string): string | null {
  // Check for SQL injection
  if (SQL_PATTERNS.some(pattern => pattern.test(value))) {
    return "SQL_INJECTION_DETECTED";
  }

  // Check for NoSQL injection
  if (NO_SQL_PATTERNS.some(pattern => pattern.test(value))) {
    return "NOSQL_INJECTION_DETECTED";
  }

  // Check for XSS
  if (XSS_PATTERNS.some(pattern => pattern.test(value))) {
    return "XSS_DETECTED";
  }

  // Check for SSRF
  if (SSRF_PATTERNS.some(pattern => pattern.test(value))) {
    return "SSRF_DETECTED";
  }

  // Check for path traversal
  if (PATH_TRAVERSAL_PATTERNS.some(pattern => pattern.test(value))) {
    return "PATH_TRAVERSAL_DETECTED";
  }

  return null;
}

function checkUrlSecurity(url: string): string | null {
  if (PATH_TRAVERSAL_PATTERNS.some(pattern => pattern.test(url))) {
    return "PATH_TRAVERSAL_DETECTED";
  }

  if (SSRF_PATTERNS.some(pattern => pattern.test(url))) {
    return "SSRF_DETECTED";
  }

  return null;
}

export function enhancedSecurityMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const clientIp = getClientIp(req);

    // Skip rate limiting for docs endpoints (Swagger UI makes many requests)
    const isDocsEndpoint = req.path.startsWith('/docs') || req.path === '/openapi.json';

    // Check if IP is blacklisted
    if (ipBlacklist.has(clientIp)) {
      console.warn(`Blocked request from blacklisted IP: ${clientIp}`);
      res.status(403).json({ error: "Access denied", code: "IP_BLACKLISTED" });
      return;
    }

    // Rate limiting check (skip for docs endpoints)
    if (!isDocsEndpoint && !checkRateLimit(clientIp)) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      res.status(429).json({ error: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" });
      return;
    }

    // Check URL security
    const urlCheck = checkUrlSecurity(req.url);
    if (urlCheck) {
      console.warn(`Security threat detected in URL: ${urlCheck}`);
      res.status(400).json({ error: "Invalid URL", code: urlCheck });
      return;
    }

    // Check query parameters
    for (const [key, value] of Object.entries(req.query)) {
      const check = checkStringSecurity(String(value));
      if (check) {
        console.warn(`Security threat detected in query param ${key}: ${check}`);
        res.status(400).json({ error: "Invalid query parameter", code: check });
        return;
      }
    }

    // Check headers
    for (const [key, value] of Object.entries(req.headers)) {
      const headerValue = Array.isArray(value) ? value.join(" ") : String(value);
      if (headerValue.includes("\n") || headerValue.includes("\r")) {
        console.warn(`Header injection attempt detected: ${key}`);
        res.status(400).json({ error: "Invalid header", code: "HEADER_INJECTION_DETECTED" });
        return;
      }
    }

    // Check request body for POST/PUT/PATCH
    if (req.method !== "GET" && req.body) {
      const bodyStr = JSON.stringify(req.body);
      const check = checkStringSecurity(bodyStr);
      if (check) {
        console.warn(`Security threat detected in request body: ${check}`);
        res.status(400).json({ error: "Invalid input", code: check });
        return;
      }
    }

    // Add security headers
    addSecurityHeaders(res, req);

    next();
  } catch (error: any) {
    console.error(`Security middleware error: ${error.message}`);
    res.status(500).json({ error: "Internal server error", code: "SECURITY_ERROR" });
  }
}

function addSecurityHeaders(res: Response, req: Request): void {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  if (Env.is_production || Env.FORCE_HTTPS) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.setHeader("X-Download-Options", "noopen");
}

export function docsAuthenticationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const docsEndpoints = ["/docs", "/redoc", "/openapi.json"];
  const isDocsEndpoint = docsEndpoints.some(endpoint => req.path.includes(endpoint));

  if (isDocsEndpoint && Env.DOCS_AUTH_ENABLED) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Basic ")) {
      res.setHeader("WWW-Authenticate", 'Basic realm="API Documentation"');
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.status(401).send("Authentication required for API documentation. Please provide valid credentials.");
      return;
    }

    try {
      const credentials = Buffer.from(authHeader.replace("Basic ", ""), "base64").toString("utf-8");
      const [username, password] = credentials.split(":", 2);

      if (username === Env.DOCS_USERNAME && password === Env.DOCS_PASSWORD) {
        next();
        return;
      } else {
        res.setHeader("WWW-Authenticate", 'Basic realm="API Documentation"');
        res.status(401).send("Invalid credentials. Please check your username and password.");
        return;
      }
    } catch (error) {
      res.status(500).send("Authentication error. Please try again.");
      return;
    }
  }

  next();
}

