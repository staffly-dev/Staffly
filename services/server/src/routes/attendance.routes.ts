import { Router } from "express";
import { createAttendanceController, getAllAttendanceController, getAttendanceController, searchAttendanceController } from "../controllers/attendance.controller";
import { authenticateToken } from "../middlewares/auth/isAuthenticated.middleware";
import { securityStack } from "../middlewares/security";






const attendanceRoutes = Router();

// Apply security stack to all employee routes
attendanceRoutes.use(...securityStack);

// Apply authentication to all employee routes
attendanceRoutes.use(authenticateToken);


// create Attendance
// /attendance/checkin
attendanceRoutes.post("/checkin",createAttendanceController);

// search by firstName and lastName
attendanceRoutes.get('/' ,searchAttendanceController )

// get All Attendance
// /attendance
attendanceRoutes.get("/", getAllAttendanceController);


// get Attendance by id
// /attendance/:id
attendanceRoutes.get("/:id", getAttendanceController);



export default attendanceRoutes;
