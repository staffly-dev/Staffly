import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/api/asyncHandler.middleware";
import { HTTPSTATUS } from "../../config/http.config";
import {
  createEmployeeService,
  getEmployeeByIdService,
  getAllEmployeesService,
  updateEmployeeService,
  deleteEmployeeService,
} from "../../services/employees/employees.service";

export const createEmployeeController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const employee = await createEmployeeService(req.body, userId);
    return res.status(HTTPSTATUS.CREATED).json({
      message: "Employee created successfully",
      employee,
    });
  }
);

export const getAllEmployeesController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const employees = await getAllEmployeesService(userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "Employees fetched successfully",
      employees,
    });
  }
);

export const getEmployeeByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const employee = await getEmployeeByIdService(req.params.id, userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "Employee fetched successfully",
      employee,
    });
  }
);

export const updateEmployeeController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const employee = await updateEmployeeService(req.params.id, req.body, userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "Employee updated successfully",
      employee
    });
  }
);

export const deleteEmployeeController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    await deleteEmployeeService(req.params.id, userId);
    return res.status(HTTPSTATUS.OK).json({
      message: "Employee deleted successfully",
    });
  }
);