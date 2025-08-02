import { Router } from "express";
import { createAttendanceController, getAllAttendanceController, getAttendanceController, searchAttendanceController } from "../../controllers/attendance/attendance.controller";
import { authenticateToken } from "../../middlewares/auth/isAuthenticated.middleware";
import { securityStack } from "../../middlewares/security";

const attendanceRoutes = Router();

// Apply security stack to all employee routes
attendanceRoutes.use(...securityStack);

// Apply authentication to all employee routes
attendanceRoutes.use(authenticateToken);

// create Attendance
// /attendance/checkin
attendanceRoutes.post("/checkin", createAttendanceController);

// search by firstName and lastName
attendanceRoutes.get('/search', searchAttendanceController)

// get All Attendance
// /attendance
attendanceRoutes.get("/getAllAttendance", getAllAttendanceController);

// get Attendance by id
// /attendance/:id
attendanceRoutes.get("/getAttendance/:id", getAttendanceController);

export default attendanceRoutes;
