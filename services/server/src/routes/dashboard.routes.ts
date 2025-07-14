import { Router } from "express";
import { authenticateToken } from "../middlewares/auth/isAuthenticated.middleware";
import { securityStack } from "../middlewares/security";
import { dashboardController, getAllAttendanceDashboardController } from "../controllers/dashboard.controller";







const dashboardRoutes = Router();

// Apply security stack to all employee routes
dashboardRoutes.use(...securityStack);

// Apply authentication to all employee routes
dashboardRoutes.use(authenticateToken);

// get dashboard (total employees , total attendance , total applicants , total projects)
// /dashboard
dashboardRoutes.get('/' ,dashboardController)

// get all attendance
// /dashboard/attendance
dashboardRoutes.get("/attendance", getAllAttendanceDashboardController);

export default dashboardRoutes;
