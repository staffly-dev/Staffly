import { Router } from "express";
import {
  createEmployeeController,
  getEmployeeByIdController,
  getAllEmployeesController,
  updateEmployeeController,
  deleteEmployeeController,
} from "../../controllers/employees/employees.controller";
import { authenticateToken } from "../../middlewares/auth/isAuthenticated.middleware";
import { securityStack } from "../../middlewares/security";
import { validateRequest } from "../../middlewares/validateRequest.middleware";
import { addEmployeeSchema, updateEmployeeSchema } from "../../validation/employees/employee.validation";

const employeeRoutes = Router();

// Apply security stack to all employee routes
employeeRoutes.use(...securityStack);

// Apply authentication to all employee routes
employeeRoutes.use(authenticateToken);

// Optional: Restrict to admin and manager roles only
// employeeRoutes.use(requireRole(['admin', 'manager']));

employeeRoutes.post("/addEmployee", validateRequest(addEmployeeSchema), createEmployeeController);
employeeRoutes.get("/getAllEmployees", getAllEmployeesController);
employeeRoutes.get("/getEmployee/:id", getEmployeeByIdController);
employeeRoutes.put("/updateEmployee/:id", validateRequest(updateEmployeeSchema), updateEmployeeController);
employeeRoutes.delete("/deleteEmployee/:id", deleteEmployeeController);

export default employeeRoutes;