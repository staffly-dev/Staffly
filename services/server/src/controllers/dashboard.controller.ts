import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/api/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { dashboardService, getAllAttendanceDashboardService } from "../services/dashboard.service";

export const dashboardController = asyncHandler(
     async (req: Request, res: Response) => {
        const dashboard = await dashboardService()
        return res.status(HTTPSTATUS.OK).json({
          message: "Dashboard fetched successfully",
          dashboard,
        });
      }
)


export const getAllAttendanceDashboardController = asyncHandler(
  async (req: Request, res: Response) => {
    const attendance = await getAllAttendanceDashboardService();
    return res.status(HTTPSTATUS.OK).json({
      message: "Attendance fetched successfully",
      attendance,
    });
  }
);