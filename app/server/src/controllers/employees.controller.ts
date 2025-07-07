import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/api/asyncHandler.middleware";
import { HTTPSTATUS } from "@/config/http.config";
import {
  createEmployeeService,
  getEmployeeByIdService,
  getAllEmployeesService,
  updateEmployeeService,
  deleteEmployeeService,
} from "@/services/employees.service";

export const createEmployeeController = asyncHandler(
  async (req: Request, res: Response) => {
    const employee = await createEmployeeService(req.body);
    return res.status(HTTPSTATUS.CREATED).json({
      message: "Employee created successfully",
      employee,
    });
  }
);

export const getAllEmployeesController = asyncHandler(
  async (req: Request, res: Response) => {
    const employees = await getAllEmployeesService();
    return res.status(HTTPSTATUS.OK).json({
      message: "Employees fetched successfully",
      employees,
    });
  }
);

export const getEmployeeByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const employee = await getEmployeeByIdService(req.params.id);
    return res.status(HTTPSTATUS.OK).json({
      message: "Employee fetched successfully",
      employee,
    });
  }
);

export const updateEmployeeController = asyncHandler(
  async (req: Request, res: Response) => {
    const employee = await updateEmployeeService(req.params.id, req.body);
    return res.status(HTTPSTATUS.OK).json({
      message: "Employee updated successfully",
      employee
    });
  }
);

export const deleteEmployeeController = asyncHandler(
  async (req: Request, res: Response) => {
    await deleteEmployeeService(req.params.id);
    return res.status(HTTPSTATUS.OK).json({
      message: "Employee deleted successfully",
    });
  }
);