import { Router } from "express";
import { authenticateToken } from "../middlewares/auth/isAuthenticated.middleware";
import { securityStack } from "../middlewares/security";
import { dashboardController, getAllAttendanceDashboardController } from "../controllers/dashboard.controller";
import { getSettingsController, updateSettingsController } from "../controllers/settings.controller";







const settingsRoutes = Router();

// Apply security stack to all employee routes
settingsRoutes.use(...securityStack);

// Apply authentication to all employee routes
settingsRoutes.use(authenticateToken);

// get settings by userId
// /settings/:userId
settingsRoutes.get('/:userId' ,getSettingsController)

settingsRoutes.put('/:userId' ,updateSettingsController)

export default settingsRoutes;
