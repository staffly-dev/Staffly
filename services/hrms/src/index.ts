import express, { NextFunction, Request, Response } from "express";
import { asyncHandler } from "./middlewares/api/asyncHandler.middleware";
import { applySecurityStack, securityStack } from "./middlewares/security";
import { HTTPSTATUS } from "./config/http.config";
import { Env } from "./config/env.config";
import { swaggerAuth } from "./middlewares/docs/swagger-docs.middleware";
import { swaggerSpec, swaggerUi } from "./swagger";
import authRoutes from "./routes/auth/auth.route";
import userRoutes from "./routes/auth/user.route";
import employeeRoutes from "./routes/employees/employees.route";
import { errorHandler } from "./middlewares/errors/errorHandler.middleware";
import connectDatabase from "./config/database.config";
import attendanceRoutes from "./routes/attendance/attendance.routes";
import dotenv from "dotenv";
import dashboardRoutes from "./routes/app/dashboard.routes";
import settingsRoutes from "./routes/app/settings.routes";
import payrollRoutes from "./routes/employees/payroll.routes";
dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

applySecurityStack(app, {
  cors: {},
  ddos: {},
  bot: {},
  rateLimit: {},
  noSQL: {},
  xss: {},
});

app.get(
  '/hrms/health',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(HTTPSTATUS.OK).json({
      status: "Healthy!",
      service: "HRMS Service",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    });
  })
);

if (Env.NODE_ENV !== 'development') {
  app.use(`/api-docs`, swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} else {
  app.use(`/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// /auth
app.use(`/hrms/auth`, authRoutes);
// /users
app.use(`/hrms/users`, userRoutes);
// /employees
app.use(`/hrms/employees`, employeeRoutes);
// /attendance
app.use(`/hrms/attendance`, attendanceRoutes);
// /dashboard
app.use(`/hrms/dashboard`, dashboardRoutes);
// /settings
app.use(`/hrms/settings`, settingsRoutes);

// /payroll
app.use('/hrms/payroll', payrollRoutes);

app.use(errorHandler);

app.listen(Env.PORT, async () => {
  console.log(`Server listening on port ${Env.PORT} in ${Env.NODE_ENV}`);
  console.log(`🔒 Security stack enabled with ${securityStack.length} protection layers`);
  await connectDatabase();
}); 