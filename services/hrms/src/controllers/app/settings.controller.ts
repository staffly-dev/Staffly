import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/api/asyncHandler.middleware";
import { HTTPSTATUS } from "../../config/http.config";
import { 
  getSettingsService, 
  updateSettingsService, 
  updatePartialSettingsService,
  resetSettingsToDefault
} from "../../services/app/settings.service";

/**
 * @desc    Get user settings
 * @route   GET /api/settings
 * @access  Private
 */
export const getSettingsController = asyncHandler(
  async (req: Request, res: Response) => {
    // Get userId from authenticated user
    const userId = req.user!.id;
    
    const settings = await getSettingsService(userId);
    
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: settings,
      message: "Settings retrieved successfully"
    });
  }
);

/**
 * @desc    Update user settings
 * @route   PUT /api/settings
 * @access  Private
 */
export const updateSettingsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const updates = req.body;
    
    const settings = await updateSettingsService(userId, updates);
    
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: settings,
      message: "Settings updated successfully"
    });
  }
);

/**
 * @desc    Update specific section of user settings
 * @route   PATCH /api/settings/:section
 * @access  Private
 */
export const updateSettingsSectionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { section } = req.params;
    const updates = req.body;
    
    // Validate section name
    const validSections = ['notifications', 'appearance', 'privacy', 'workspace'];
    if (!validSections.includes(section as string)) {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        success: false,
        message: `Invalid settings section. Must be one of: ${validSections.join(', ')}`
      });
    }
    
    const settings = await updatePartialSettingsService(
      userId,
      section as any,
      updates
    );
    
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: settings,
      message: `${(section as string).charAt(0).toUpperCase() + (section as string).slice(1)} settings updated successfully`
    });
  }
);

/**
 * @desc    Reset all settings to default
 * @route   DELETE /api/settings/reset
 * @access  Private
 */
export const resetSettingsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    
    const settings = await resetSettingsToDefault(userId);
    
    return res.status(HTTPSTATUS.OK).json({
      success: true,
      data: settings,
      message: "Settings reset to default successfully"
    });
  }
);