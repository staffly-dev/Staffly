import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RateLimitMiddleware.name);
  private readonly store: RateLimitStore = {};
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  private readonly maxRequests = 100; // requests per window

  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `rate-limit:${ip}`;
    const now = Date.now();

    // Clean up expired entries
    this.cleanupExpired(now);

    // Get or create rate limit entry
    let entry = this.store[key];
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + this.windowMs,
      };
      this.store[key] = entry;
    }

    // Increment counter
    entry.count++;

    // Set headers
    res.set({
      'X-RateLimit-Limit': this.maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, this.maxRequests - entry.count).toString(),
      'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
    });

    // Check if limit exceeded
    if (entry.count > this.maxRequests) {
      this.logger.warn(`Rate limit exceeded for IP: ${ip}`, {
        ip,
        path: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
      });

      return res.status(429).json({
        success: false,
        message: 'Too many requests',
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
      });
    }

    next();
  }

  private cleanupExpired(now: number): void {
    for (const key in this.store) {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    }
  }
}
