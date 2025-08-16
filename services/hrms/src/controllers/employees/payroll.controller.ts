import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/api/asyncHandler.middleware";
import { HTTPSTATUS } from "../../config/http.config";
import { createPayrollService, deletePayrollService, getAllPayrollService, searchPayrollService, updatePayrollService } from "../../services/employees/payroll.service";

export const createPayrollController = asyncHandler(
  async (req: Request, res: Response) => {
    const { employeeId, ctc, salaryByMonth, deduction } = req.body;
    const payroll = await createPayrollService(employeeId, ctc, salaryByMonth, deduction);
    return res.status(HTTPSTATUS.CREATED).json({
      message: "Payroll created successfully",
      payroll,
    });
  }
);

export const getAllPayrollController = asyncHandler(
  async (req: Request, res: Response) => {
    const payroll = await getAllPayrollService();
    return res.status(HTTPSTATUS.OK).json({
      message: "Payroll fetched successfully",
      payroll,
    });
  }
);

export const searchPayrollController = asyncHandler(
  async (req: Request, res: Response) => {
    const { firstName, lastName } = req.query;
    const payroll = await searchPayrollService(firstName?.toString() || "", lastName?.toString() || "");
    return res.status(HTTPSTATUS.OK).json({
      message: "Attendance fetched successfully",
      payroll,
    });
  }
);

export const updatePayrollController = asyncHandler(
  async (req: Request, res: Response) => {
    const { employeeId, ctc, salaryByMonth, deduction } = req.body;
    const payroll = await updatePayrollService(req.params.id, employeeId, ctc, salaryByMonth, deduction);
    return res.status(HTTPSTATUS.OK).json({
      message: "Payroll updated successfully",
      payroll,
    });
  }
);

export const deletePayrollController = asyncHandler(
  async (req: Request, res: Response) => {
    const { employeeId, ctc, salaryByMonth, deduction } = req.body;
    const payroll = await deletePayrollService(req.params.id);
    return res.status(HTTPSTATUS.OK).json({
      message: "Payroll deleted successfully",
    });
  }
);
