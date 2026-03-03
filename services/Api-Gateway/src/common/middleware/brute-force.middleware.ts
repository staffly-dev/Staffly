import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface BruteForceStore {
  [key: string]: {
    attempts: number;
    lockoutUntil: number;
    firstAttempt: number;
  };
}

@Injectable()
export class BruteForceMiddleware implements NestMiddleware {
  private readonly logger = new Logger(BruteForceMiddleware.name);
  private readonly store: BruteForceStore = {};
  private readonly maxAttempts = 5;
  private readonly lockoutDuration = 15 * 60 * 1000; // 15 minutes
  private readonly resetDuration = 60 * 60 * 1000; // 1 hour

  use(req: Request, res: Response, next: NextFunction) {
    // Only apply to login/auth endpoints
    if (!this.isAuthEndpoint(req.path)) {
      return next();
    }

    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const email = req.body?.email || 'unknown';
    const key = `brute-force:${ip}:${email}`;
    const now = Date.now();

    // Clean up expired entries
    this.cleanupExpired(now);

    // Get or create entry
    let entry = this.store[key];
    if (!entry) {
      entry = {
        attempts: 0,
        lockoutUntil: 0,
        firstAttempt: now,
      };
      this.store[key] = entry;
    }

    // Check if currently locked out
    if (entry.lockoutUntil > now) {
      const remainingTime = Math.ceil((entry.lockoutUntil - now) / 1000);
      
      this.logger.warn(`Brute force protection - IP locked out: ${ip}`, {
        ip,
        email,
        path: req.path,
        attempts: entry.attempts,
        remainingTime,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
      });

      return res.status(429).json({
        success: false,
        message: 'Too many failed attempts. Please try again later.',
        error: 'Account temporarily locked',
        retryAfter: remainingTime,
      });
    }

    // Increment attempt counter on failed requests
    // Note: This will be updated by the auth controller on login failure
    req.bruteForce = {
      key,
      onSuccess: () => this.onSuccess(key),
      onFailure: () => this.onFailure(key),
    };

    next();
  }

  private isAuthEndpoint(path: string): boolean {
    const authEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh-token',
      '/auth/reset-password',
    ];
    return authEndpoints.some(endpoint => path.includes(endpoint));
  }

  private onSuccess(key: string): void {
    delete this.store[key];
  }

  private onFailure(key: string): void {
    const entry = this.store[key];
    if (entry) {
      entry.attempts++;
      
      // Lock out if max attempts reached
      if (entry.attempts >= this.maxAttempts) {
        entry.lockoutUntil = Date.now() + this.lockoutDuration;
        
        this.logger.error(`Brute force protection - Max attempts reached`, {
          key,
          attempts: entry.attempts,
          lockoutUntil: new Date(entry.lockoutUntil).toISOString(),
        });
      }
    }
  }

  private cleanupExpired(now: number): void {
    for (const key in this.store) {
      const entry = this.store[key];
      if (now > entry.lockoutUntil && now > entry.firstAttempt + this.resetDuration) {
        delete this.store[key];
      }
    }
  }
}

// Extend Request interface to include brute force data
declare global {
  namespace Express {
    interface Request {
      bruteForce?: {
        key: string;
        onSuccess: () => void;
        onFailure: () => void;
      };
    }
  }
}
