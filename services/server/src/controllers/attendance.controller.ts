import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/api/asyncHandler.middleware";
import { NextFunction } from "http-proxy-middleware/dist/types";
import { HTTPSTATUS } from "../config/http.config";
import { recordCheckInService, getAllAttendanceService, getAttendanceService, searchAttendanceService } from "../services/attendance.service";

export const createAttendanceController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { employeeId, checkInTime } = req.body;
    const attendance = await recordCheckInService(employeeId, checkInTime ? new Date(checkInTime) : undefined);
    return res.status(HTTPSTATUS.CREATED).json({
      message: "Attendance created successfully",
      attendance,
    });
  }
);

export const getAllAttendanceController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const attendance = await getAllAttendanceService();
    return res.status(HTTPSTATUS.OK).json({
      message: "Attendance fetched successfully",
      attendance,
    });
  }
);


export const getAttendanceController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const attendance = await getAttendanceService(req.params.id);
    return res.status(HTTPSTATUS.OK).json({
      message: "Attendance fetched successfully",
      attendance,
    });
  }
)


export const searchAttendanceController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { firstName, lastName } = req.query;
    const attendance = await searchAttendanceService(firstName?.toString() || "", lastName?.toString() || "");
    return res.status(HTTPSTATUS.OK).json({
      message: "Attendance fetched successfully",
      attendance,
    });
  }
) 