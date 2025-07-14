import "dotenv/config";
import express, { Request, Response, NextFunction } from 'express';
import { asyncHandler } from "./middlewares/api/asyncHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errors/errorHandler.middleware";
import { Env } from "./config/env.config";
import connectDatabase from "./config/database.config";
import { swaggerUi, swaggerSpec } from "./swagger";

import { swaggerAuth } from "./middlewares/docs/swagger-docs.middleware";

import { applySecurityStack, securityStack } from "./middlewares/security";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

// app.use(express.json());
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
  app.use(`/api-docs`, swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} else {
  app.use(`/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// localhost http://localhost:4004/servers/auth/login ==> direct to proxy http://localhost:4005/server/auth/login
app.use('/server', createProxyMiddleware({
  target: 'http://localhost:4005',
  changeOrigin: true,
  pathRewrite: {
    '^/server': '/server',
  }

}));

app.use(errorHandler);

app.listen(Env.PORT, async () => {
  console.log(`Server listening on port ${Env.PORT} in ${Env.NODE_ENV}`);
  console.log(`🔒 Security stack enabled with ${securityStack.length} protection layers`);
  await connectDatabase();
});