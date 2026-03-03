import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import configuration from '../config/configuration';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorsMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const origin = req.headers.origin;
    const allowedOrigins = configuration().FRONTEND_ORIGIN?.split(',') || [
      'http://localhost:3000',
    ];

    // Set CORS headers - strict origin validation
    if (allowedOrigins.includes(origin as string)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else if (origin) {
      this.logger.warn(`CORS violation - origin not allowed: ${origin}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        timestamp: new Date().toISOString(),
      });
      return res.status(403).json({
        success: false,
        message: 'CORS policy violation',
        error: 'Origin not allowed',
      });
    }

    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With',
    );
    res.header('Access-Control-Allow-Credentials', 'true');

    // Security headers
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    next();
  }
}
