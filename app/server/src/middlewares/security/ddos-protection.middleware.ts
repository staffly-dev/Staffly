import { Request, Response, NextFunction, RequestHandler } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { logSecurityEvent } from '@/utils/securityLogger';

/**
 * DDoS Protection Configuration
 */
export interface DDOSProtectionConfig {
  burst?: number;
  limit?: number;
  windowMs?: number;
  blacklist?: string[];
  whitelist?: string[];
  autoBanCount?: number;
  autoBanTime?: number;
  skipRoutes?: string[];
  logger?: (msg: string, meta?: any) => void;
}

const env = process.env;

const DEFAULT_CONFIG: Required<DDOSProtectionConfig> = {
  burst: parseInt(env.DDOS_BURST || '10', 10),
  limit: parseInt(env.DDOS_LIMIT || '100', 10),
  windowMs: parseInt(env.DDOS_WINDOW_MS || '60000', 10),
  blacklist: (env.DDOS_BLACKLIST || '').split(',').filter(Boolean),
  whitelist: (env.DDOS_WHITELIST || '').split(',').filter(Boolean),
  autoBanCount: parseInt(env.DDOS_AUTO_BAN_COUNT || '5', 10),
  autoBanTime: parseInt(env.DDOS_AUTO_BAN_TIME || '600000', 10),
  skipRoutes: [],
  logger: (msg, meta) => console.warn(`[DDoS] ${msg}`, meta || ''),
};

// Sliding window store for requests per IP
const ipStore = new Map<string, { timestamps: number[]; banUntil?: number; banCount: number }>();

/**
 * DDoS Protection Middleware
 * @param userConfig Optional configuration overrides
 */
export function createDDOSProtectionMiddleware(userConfig: DDOSProtectionConfig = {}): RequestHandler {
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Skip protection for specified routes
    if (config.skipRoutes.some(pattern => {
      const regexPattern = pattern.replace(/\*/g, '.*');
      const regex = new RegExp(`^${regexPattern}$`);
      return regex.test(req.path);
    })) {
      next();
      return;
    }

    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    // Whitelist check
    if (config.whitelist.includes(ip)) {
      next();
      return;
    }

    // Blacklist check
    if (config.blacklist.includes(ip)) {
      config.logger('Blocked blacklisted IP', { ip });
      await logSecurityEvent({
        ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        route: req.originalUrl || req.path,
        attackType: 'DDoS (blacklist)',
        details: {}
      });
      res.status(429).json({ error: 'Too many requests (DDoS protection)', errorCode: 'DDOS_PROTECTION' });
      return;
    }

    // Get or initialize IP data
    let data = ipStore.get(ip);
    if (!data) {
      data = { timestamps: [], banCount: 0 };
      ipStore.set(ip, data);
    }

    // Auto-ban check
    if (data.banUntil && now < data.banUntil) {
      config.logger('Auto-banned IP tried to access', { ip });
      await logSecurityEvent({
        ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        route: req.originalUrl || req.path,
        attackType: 'DDoS (auto-ban)',
        details: { banUntil: data.banUntil }
      });
      res.status(429).json({ error: 'Too many requests (auto-ban)', errorCode: 'DDOS_AUTOBAN' });
      return;
    }

    // Remove old timestamps outside window
    data.timestamps = data.timestamps.filter(ts => now - ts < config.windowMs);
    data.timestamps.push(now);

    // Sliding window logic
    if (data.timestamps.length > config.limit + config.burst) {
      data.banCount = (data.banCount || 0) + 1;
      config.logger('DDoS threshold exceeded', { ip, count: data.timestamps.length, banCount: data.banCount });
      await logSecurityEvent({
        ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        route: req.originalUrl || req.path,
        attackType: 'DDoS',
        details: { count: data.timestamps.length, banCount: data.banCount }
      });
      // Auto-ban if exceeded too many times
      if (data.banCount >= config.autoBanCount) {
        data.banUntil = now + config.autoBanTime;
        config.logger('IP auto-banned', { ip, until: new Date(data.banUntil).toISOString() });
        res.status(429).json({ error: 'Too many requests (auto-ban)', errorCode: 'DDOS_AUTOBAN' });
        return;
      }
      res.status(429).json({ error: 'Too many requests (DDoS protection)', errorCode: 'DDOS_PROTECTION' });
      return;
    }

    // Reset banCount if under threshold
    if (data.timestamps.length < config.limit) {
      data.banCount = 0;
    }

    next();
  };
}

/**
 * Default DDoS protection middleware with .env config
 */
export const ddosProtectionMiddleware = createDDOSProtectionMiddleware();
