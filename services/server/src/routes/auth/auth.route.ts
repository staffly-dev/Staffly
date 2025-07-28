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
} from "../../controllers/auth/auth.controller";

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

export default authRoutes;