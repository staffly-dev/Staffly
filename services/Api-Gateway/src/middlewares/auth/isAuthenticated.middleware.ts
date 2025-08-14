import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Env } from "../../config/env.config";
import { UnauthorizedException } from "../../utils/app-error";

// Optionally extend Request to carry minimal user context through the gateway
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const isAuthenticated = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Access token required");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new UnauthorizedException("Access token required");
    }

    const decoded = jwt.verify(token, Env.JWT_SECRET, {
      audience: Env.JWT_AUDIENCE,
    }) as JwtPayload | string;

    // Attach minimal context for downstream services (via header and req)
    if (decoded && typeof decoded === "object") {
      const userId = (decoded as any).userId as string | undefined;
      if (userId) {
        req.userId = userId;
        // Forward user id to downstream services via header
        req.headers["x-user-id"] = userId;
      }
    }

    return next();
  } catch (err) {
    return next(new UnauthorizedException("Invalid or expired access token"));
  }
};
