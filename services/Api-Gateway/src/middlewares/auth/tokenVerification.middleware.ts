import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { HTTPSTATUS } from '../../config/http.config';
import { Env } from '../../config/env.config';

/**
 * Middleware to verify access token with HRMS service
 * If token is valid, attaches user data to request object
 * If token is invalid or missing, returns 401 Unauthorized
 */
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip token verification for public routes (like health check, login, etc.)
    if (req.path === '/hrms/health' || req.path.startsWith('/api/v1/hrms/auth') || req.path.startsWith('/api/v1/hrms/api-docs')) {
      return next();
    }

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Access token is required',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Invalid token format',
      });
    }

    // Call HRMS service to verify token
    const response = await axios.post(
      `${Env.HRMS_SERVICE_URL}/hrms/auth/verify-token`,
      { token },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': Env.INTERNAL_API_KEY,
        },
      }
    );

    // Attach user data to request object for use in route handlers
    req.user = response.data.data.user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error verifying token',
    });
  }
};

// Type augmentation for Express Request object
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}
