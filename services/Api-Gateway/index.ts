import express, { NextFunction, Request, Response } from "express";
import { asyncHandler } from "server/middlewares/api/asyncHandler.middleware";
import { applySecurityStack, securityStack } from "server/middlewares/security";
import { HTTPSTATUS } from "server/config/http.config";
import { Env } from "server/config/env.config";
import { swaggerAuth } from "server/middlewares/docs/swagger-docs.middleware";
import { swaggerSpec, swaggerUi } from "server/swagger";
import authRoutes from "server/routes/auth.route";
import userRoutes from "server/routes/user.route";
import employeeRoutes from "server/routes/employees.route";
import { errorHandler } from "server/middlewares/errors/errorHandler.middleware";
import connectDatabase from "server/config/database.config";
import attendanceRoutes from "server/routes/attendance.routes";
import dotenv from "dotenv";
import dashboardRoutes from "server/routes/dashboard.routes";
import settingsRoutes from "server/routes/settings.routes";
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
  '/',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(HTTPSTATUS.OK).json({
      status: "Healthy!",
    });
  })
);

if (Env.NODE_ENV !== 'development') {
  app.use(`/user/api-docs`, swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} else {
  app.use(`/user/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}


// /server/auth
app.use(`/auth`, authRoutes);

// /server/users
app.use(`/users`, userRoutes);

// /server/employees
app.use(`/employees`, employeeRoutes);

// /server/attendance
app.use(`/attendance`, attendanceRoutes);

// /server/dashboard
app.use(`/dashboard`, dashboardRoutes);

app.use(`/settings`, settingsRoutes);

app.use(errorHandler);

app.listen( Env.API_GATEWAY_PORT, async () => {
  console.log(`Server listening on port ${Env.API_GATEWAY_PORT} in development`);
  console.log(`🔒 Security stack enabled with ${securityStack.length} protection layers`);
  await connectDatabase();
});
