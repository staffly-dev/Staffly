import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth/isAuthenticated.middleware";
import { securityStack } from "../../middlewares/security";
import { 
  getSettingsController, 
  updateSettingsController, 
  updateSettingsSectionController,
  resetSettingsController 
} from "../../controllers/app/settings.controller";

const settingsRoutes = Router();

// Apply security stack to all settings routes
settingsRoutes.use(...securityStack);

// Apply authentication to all settings routes
settingsRoutes.use(authenticateToken);

settingsRoutes.get('/', getSettingsController);
settingsRoutes.put('/', updateSettingsController);
settingsRoutes.patch('/:section', updateSettingsSectionController);
settingsRoutes.delete('/reset', resetSettingsController);

export default settingsRoutes;
