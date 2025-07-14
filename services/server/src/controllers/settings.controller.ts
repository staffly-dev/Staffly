import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/api/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { getSettingsService, updateSettingsService } from "../services/settings.service";



export const getSettingsController = asyncHandler(
    async (req: Request, res: Response) => {
        const settings = await getSettingsService(req.params.userId)
        return res.status(HTTPSTATUS.OK).json({
          message: "Settings fetched successfully",
          settings,
        });
      }
)

export const updateSettingsController = asyncHandler(
    async (req: Request, res: Response) => {
        const settings = await updateSettingsService(req.params.userId , req.body)
        return res.status(HTTPSTATUS.OK).json({
          message: "Settings updated successfully",
          settings,
        });
      }
)