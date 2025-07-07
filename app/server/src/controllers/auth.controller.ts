import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/api/asyncHandler.middleware";
import { HTTPSTATUS } from "@/config/http.config";
import {
  loginUserService,
  logoutAllDevicesService,
  logoutService,
  refreshTokenService,
  registerUserService,
  requestResetPasswordService,
  resetPasswordService,
  verifyEmailCodeService,
  verifyResetPasswordCodeService,
} from "@/services/auth.service";
import { UnauthorizedException } from "@/utils/app-error";
import {
  loginSchema,
  registerSchema,
  requestResetPasswordSchema,
  verifyResetCodeSchema,
  resetPasswordSchema,
  verifyEmailSchema
} from "@/validation/auth.validation";

// ============== Register controllers ==============
export const registerUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = registerSchema.parse({
      ...req.body,
    });

    const { user } = await registerUserService(body);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "User registered successfully",
      data: user.omitPassword(),
    });
  }
);

export const verifyEmailCodeController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = verifyEmailSchema.parse(req.body);

    await verifyEmailCodeService(body.email, body.code);

    return res.status(HTTPSTATUS.OK).json({
      message: "Email verified successfully",
    });
  }
);

// ============== Login controllers ==============
export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = loginSchema.parse({...req.body});

    const userAgent = req.headers["user-agent"] || "unknown";

    const { user, accessToken, refreshToken } = await loginUserService({
      ...body,
      userAgent,
    });

    return res.status(HTTPSTATUS.OK).json({
      message: "User logged in successfully",
      data: {
        user,
        accessToken,
        refreshToken,
      },
    });
  }
);

// ============== Refresh Token controllers ==============
export const refreshTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const userAgent = req.headers["user-agent"] || "unknown";

    // Extract the refresh token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing or invalid access token");
    }
    const refresh_token = authHeader.split(" ")[1];

    const { accessToken, refreshToken } = await refreshTokenService(
      refresh_token,
      userAgent
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Refreshed token successfully",
      accessToken,
      refreshToken,
    });
  }
);

// ============== Forget Password controllers ==============
export const requestResetPassController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = requestResetPasswordSchema.parse(req.body);

    const result = await requestResetPasswordService(body.email);

    return res.status(HTTPSTATUS.OK).json({
      message: result.message,
    });
  }
);

export const verifyResetPassCodeController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = verifyResetCodeSchema.parse(req.body);

    const result = await verifyResetPasswordCodeService(body.email, body.code);

    return res.status(HTTPSTATUS.OK).json({
      message: result.message,
      data: {
        resetToken: result.resetToken,
      },
    });
  }
);

export const resetPasswordController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = resetPasswordSchema.parse(req.body);

    const result = await resetPasswordService(body.resetToken, body.newPassword);

    return res.status(HTTPSTATUS.OK).json({
      message: result.message,
    });
  }
);

// ============== Logout controllers ==============
export const logOutController = asyncHandler(
  async (req: Request, res: Response) => {
    const userAgent = req.headers["user-agent"] || "unknown";

    // Extract the refresh token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing or invalid refresh token");
    }
    const refreshToken = authHeader.split(" ")[1];

    const result = await logoutService(refreshToken, userAgent);

    return res.status(HTTPSTATUS.OK).json({
      message: result.message,
    });
  }
);

export const logOutAllDevicesController = asyncHandler(
  async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing or invalid refresh token");
    }
    const refreshToken = authHeader.split(" ")[1];

    const result = await logoutAllDevicesService(refreshToken);

    return res.status(HTTPSTATUS.OK).json({
      message: result.message,
    });
  }
);