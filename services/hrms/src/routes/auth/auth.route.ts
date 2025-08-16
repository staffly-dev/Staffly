import { Router } from "express";
import {
  registerUserController,
  verifyEmailCodeController,
  loginController,
  refreshTokenController,
  requestResetPassController,
  verifyResetPassCodeController,
  resetPasswordController,
  logOutController,
  logOutAllDevicesController,
  verifyTokenController,
} from "../../controllers/auth/auth.controller";
import { validateRequest } from "../../middlewares/validateRequest.middleware";
import { verifyTokenSchema } from "../../validation/auth/auth.validation";

const authRoutes = Router();

// Register routes
authRoutes.post("/register", registerUserController);
authRoutes.post("/verify-email", verifyEmailCodeController);

// Login routes
authRoutes.post("/login", loginController);
authRoutes.get("/refresh", refreshTokenController);

// Forget password routes
authRoutes.post("/request-resetPass", requestResetPassController);
authRoutes.post("/verify-resetPass-code", verifyResetPassCodeController);
authRoutes.post("/reset-password", resetPasswordController);

// Logout route
authRoutes.post("/logout", logOutController);
authRoutes.post("/logout-all", logOutAllDevicesController);

// Utility endpoints for inter-service communication
authRoutes.post(
  "/verify-token",
  validateRequest(verifyTokenSchema),
  verifyTokenController
);

export default authRoutes;