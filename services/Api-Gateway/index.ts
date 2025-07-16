import "dotenv/config";
import express, { Request, Response, NextFunction } from 'express';
import { asyncHandler } from "server/middlewares/api/asyncHandler.middleware";
import { HTTPSTATUS } from "server/config/http.config";
import { errorHandler } from "server/middlewares/errors/errorHandler.middleware";
import { Env } from "server/config/env.config";
import connectDatabase from "server/config/database.config";
import { swaggerUi, swaggerSpec } from "server/swagger";

import { swaggerAuth } from "server/middlewares/docs/swagger-docs.middleware";

import { applySecurityStack, securityStack } from "server/middlewares/security";
import { createProxyMiddleware } from "http-proxy-middleware";

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
  app.use(`/api-docs`, swaggerAuth, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
} else {
  app.use(`/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// localhost http://localhost:4005/auth/login ==> direct to proxy http://localhost:4004/auth/login
app.use('/server', createProxyMiddleware({
  target: 'http://localhost:4004',
  changeOrigin: true,
  pathRewrite: {
    '^/server': '',
  }
}
));

app.use(errorHandler);

app.listen(Env.API_GATEWAY_PORT, async () => {
  console.log(`Server listening on port ${Env.API_GATEWAY_PORT} in development`);
  console.log(`🔒 Security stack enabled with ${securityStack.length} protection layers`);
  await connectDatabase();
});
