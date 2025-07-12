import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/api/asyncHandler.middleware";
import { UnauthorizedException } from "../utils/app-error";
import { HTTPSTATUS } from "../config/http.config";
import { getCurrentUserService } from "../services/user.service";

export const getCurrentUserController = asyncHandler(
  async (req: Request, res: Response) => {
    // Extract the access token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing or invalid access token");
    }

    const accessToken = authHeader.split(" ")[1];

    const user = await getCurrentUserService(accessToken);

    return res.status(HTTPSTATUS.OK).json({
      message: "Current user fetched successfully",
      user,
    });
  }
);