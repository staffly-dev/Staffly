import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth/isAuthenticated.middleware";
import { securityStack } from "../../middlewares/security";
import { createPayrollController, getAllPayrollController, updatePayrollController, deletePayrollController, searchPayrollController } from "../../controllers/employees/payroll.controller";

const payrollRoutes = Router();

// Apply security stack to all employee routes
payrollRoutes.use(...securityStack);

// Apply authentication to all employee routes
payrollRoutes.use(authenticateToken);

// create payroll
// /payroll
payrollRoutes.post('/createPayroll', createPayrollController);

// search by firstName and lastName
// /payroll
payrollRoutes.get('/search', searchPayrollController)

// get all payroll
// /payroll
payrollRoutes.get('/getAllPayroll', getAllPayrollController)

// update payroll
// /payroll/:id
payrollRoutes.put('/updatePayroll/:id', updatePayrollController);

// delete payroll
// /payroll/:id
payrollRoutes.delete('/deletePayroll/:id', deletePayrollController);

export default payrollRoutes;
