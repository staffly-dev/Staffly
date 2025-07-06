import "dotenv/config";
import express, { Request, Response, NextFunction } from 'express';
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { Env } from "./config/env.config";
import connectDatabase from "./config/database.config";
import { swaggerUi, swaggerSpec } from "./swagger";

import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import { swaggerAuth } from "./middlewares/swagger-auth.middleware";

// Import comprehensive security stack
import { applySecurityStack, securityStack } from "./middlewares/security";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply comprehensive security stack
applySecurityStack(app, {
  // Customize security layers as needed
  cors: {
    // Your CORS settings are already in .env
  },
  ddos: {
    // Your DDoS settings are already in .env
  },
  bot: {
    // Bot protection settings
  },
  rateLimit: {
    // Rate limiting settings
  },
  noSQL: {
    // NoSQL protection settings
  },
  xss: {
    // XSS protection settings
  },
  // Skip specific layers if needed
  // skipLayers: ['bot'], // Example: skip bot protection
});

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
  console.log(`🔒 Security stack enabled with ${securityStack.length} protection layers`);
  await connectDatabase();
});