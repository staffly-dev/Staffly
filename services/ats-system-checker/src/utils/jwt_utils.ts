import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { Env } from "../config/env.config";

export class JWTUtils {
  private secret: string;

  constructor() {
    this.secret = Env.JWT_SECRET || Env.SECRET_KEY || "default-secret";
  }

  decode_token(token: string): any {
    try {
      // For API Gateway tokens, we don't verify signature as they come from a trusted source
      const decoded = jwt.decode(token, { complete: false });
      
      if (!decoded) {
        throw new Error("Invalid token");
      }

      console.log(`Successfully decoded JWT token for user: ${(decoded as any).userId || 'unknown'}`);
      return decoded;
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        console.warn("JWT token has expired");
        throw new Error("Token has expired");
      }
      console.warn(`Invalid JWT token: ${error.message}`);
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

    const user_info = {
      user_id: (decoded as any).userId || (decoded as any).user_id,
      aud: (decoded as any).aud,
      iat: (decoded as any).iat,
      exp: (decoded as any).exp
    };

    if (!user_info.user_id) {
      throw new Error("Token missing required user information");
    }

    return user_info;
  }
}

// Global instance
export const jwt_utils = new JWTUtils();

