import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/api/asyncHandler.middleware";
import { HTTPSTATUS } from "../../config/http.config";
import {
  createPayrollService,
  deletePayrollService,
  getAllPayrollService,
  searchPayrollService,
  updatePayrollService
} from "../../services/employees/payroll.service";
import EmployeeModel from "../../models/employees/employee.model";
import { NotFoundException } from "../../utils/app-error";

export const createPayrollController = asyncHandler(
  async (req: Request, res: Response) => {
    const { employeeId, ctc, salaryByMonth, deduction } = req.body;
    const userId = req.user!.id;

    // Verify the employee belongs to the user
    const employee = await EmployeeModel.findOne({ _id: employeeId, createdBy: userId });
    if (!employee) {
      throw new NotFoundException('Employee not found or access denied');
    }

    const payroll = await createPayrollService(employeeId, ctc, salaryByMonth, deduction, userId);
    return res.status(HTTPSTATUS.CREATED).json({
      message: "Payroll created successfully",
      payroll,
    });
  }
);

export const getAllPayrollController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const payrolls = await getAllPayrollService(userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "Payroll fetched successfully",
      payroll: payrolls,
    });
  }
);

export const searchPayrollController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { firstName, lastName } = req.query;
    const payrolls = await searchPayrollService(
      userId,
      firstName as string,
      lastName as string
    );
    return res.status(HTTPSTATUS.OK).json({
      message: "Attendance fetched successfully",
      payroll: payrolls,
    });
  }
);

export const updatePayrollController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;
    const { employeeId, ctc, salaryByMonth, deduction } = req.body;

    // Verify the employee belongs to the user
    if (employeeId) {
      const employee = await EmployeeModel.findOne({ _id: employeeId, createdBy: userId });
      if (!employee) {
        throw new NotFoundException('Employee not found or access denied');
      }
    }

    const payroll = await updatePayrollService(
      id as string,
      employeeId,
      ctc,
      salaryByMonth,
      deduction,
      userId
    );
    return res.status(HTTPSTATUS.OK).json({
      message: "Payroll updated successfully",
      payroll,
    });
  }
);

export const deletePayrollController = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    await deletePayrollService(id as string, userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "Payroll deleted successfully",
    });
  }
);
