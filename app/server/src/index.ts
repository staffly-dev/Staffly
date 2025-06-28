import "dotenv/config";
import cors from "cors";
import express, { Request, Response, NextFunction } from 'express';
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { Env } from "./config/env.config";
import connectDatabase from "./config/database.config";
import helmet from "helmet";
import { swaggerUi, swaggerSpec } from "./swagger";

import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import { swaggerAuth } from "./middlewares/swagger-auth.middleware";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  helmet({
    contentSecurityPolicy: false,
    hsts: {
      maxAge: 63072000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: { action: "deny" },
    noSniff: true,
    hidePoweredBy: true,
    xssFilter: false,
    referrerPolicy: { policy: "no-referrer" },
  })
);

app.use(
  cors({
    origin: Env.FRONTEND_ORIGIN,
  })
);

app.get(
  '/',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    return res.status(HTTPSTATUS.OK).json({
      status: "Healthy!",
    });
  })
);

if (Env.NODE_ENV !== 'production') {
  app.use(`/api-docs`, swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} else {
  app.use(`/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

app.use(`/api/auth`, authRoutes);
app.use(`/api/users`, userRoutes);

app.use(errorHandler);

app.listen(Env.PORT, async () => {
  console.log(`Server listening on port ${Env.PORT} in ${Env.NODE_ENV}`);
  await connectDatabase();
});