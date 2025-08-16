import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/api/asyncHandler.middleware";
import { NextFunction } from "http-proxy-middleware/dist/types";
import { HTTPSTATUS } from "../../config/http.config";
import { recordCheckInService, getAllAttendanceService, getAttendanceService, searchAttendanceService } from "../../services/attendance/attendance.service";
import EmployeeModel from "../../models/employees/employee.model";
import { NotFoundException } from "../../utils/app-error";

export const createAttendanceController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { employeeId, checkInTime } = req.body;
    const userId = req.user!.id;

    // Verify the employee belongs to the user
    const employee = await EmployeeModel.findOne({ _id: employeeId, createdBy: userId });
    if (!employee) {
      throw new NotFoundException('Employee not found or access denied');
    }

    const attendance = await recordCheckInService(
      employeeId,
      checkInTime ? new Date(checkInTime) : undefined,
      userId
    );
    return res.status(HTTPSTATUS.CREATED).json({
      message: "Attendance created successfully",
      attendance,
    });
  }
);

export const getAllAttendanceController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const attendance = await getAllAttendanceService(userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "Attendance fetched successfully",
      attendance,
    });
  }
);

export const getAttendanceController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const attendance = await getAttendanceService(req.params.id, userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "Attendance fetched successfully",
      attendance,
    });
  }
);

export const searchAttendanceController = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id;
    const { firstName, lastName } = req.query;
    const attendance = await searchAttendanceService(
      userId,
      firstName?.toString() || "",
      lastName?.toString() || ""
    );
    return res.status(HTTPSTATUS.OK).json({
      message: "Attendance fetched successfully",
      attendance,
    });
  }
);