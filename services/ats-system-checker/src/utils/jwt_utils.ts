import jwt from "jsonwebtoken";
import { Env } from "../config/env.config";

/** Decoded JWT payload from API Gateway / auth provider */
export interface JwtPayload {
  userId?: string;
  user_id?: string;
  aud?: string[];
  iat?: number;
  exp?: number;
  [key: string]: unknown;
}

export class JWTUtils {
  private secret: string;

  constructor() {
    this.secret = Env.JWT_SECRET || Env.SECRET_KEY || "default-secret";
  }

  decode_token(token: string): JwtPayload | null {
    try {
      const decoded = jwt.decode(token, { complete: false });
      if (!decoded || typeof decoded === "string") {
        throw new Error("Invalid token");
      }
      const payload = decoded as JwtPayload;
      const userId = payload.userId ?? payload.user_id ?? "unknown";
      console.log(`Successfully decoded JWT token for user: ${userId}`);
      return payload;
    } catch (error: unknown) {
      if (error && typeof error === "object" && "name" in error && (error as { name: string }).name === "TokenExpiredError") {
        console.warn("JWT token has expired");
        throw new Error("Token has expired");
      }
      const message = error instanceof Error ? error.message : "Invalid token";
      console.warn(`Invalid JWT token: ${message}`);
      throw new Error("Invalid token");
    }
  }

  extract_user_info(token: string): {
    user_id: string;
    aud?: string[];
    iat?: number;
    exp?: number;
  } {
    const decoded = this.decode_token(token);
    if (!decoded) {
      throw new Error("Could not extract user information from token");
    }
    const user_id = decoded.userId ?? decoded.user_id;
    if (!user_id) {
      throw new Error("Token missing required user information");
    }
    return {
      user_id: String(user_id),
      aud: decoded.aud,
      iat: decoded.iat,
      exp: decoded.exp
    };
  }
}

// Global instance
export const jwt_utils = new JWTUtils();

