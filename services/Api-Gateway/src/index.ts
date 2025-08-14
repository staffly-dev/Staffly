import "dotenv/config";
import express, { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from "http-proxy-middleware";
import { HTTPSTATUS } from "./config/http.config";
import { Env } from "./config/env.config";
import { asyncHandler } from "./middlewares/api/asyncHandler.middleware";
import { errorHandler } from "./middlewares/errors/errorHandler.middleware";
import { applySecurityStack, securityStack } from "./middlewares/security";
import connectDatabase from "./config/database.config";
import { isAuthenticated } from "./middlewares/auth/isAuthenticated.middleware";

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

// localhost http://localhost:4005/server/auth/login ==> direct to proxy http://localhost:4004/auth/login
app.use('/server', createProxyMiddleware({
  target: Env.SERVER_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/server': '',
  }
}
));

// localhost http://localhost:4005/ats/test ==> direct to proxy http://localhost:4000/ats/test
// Protect ATS proxy with authentication
app.use('/ats', isAuthenticated, createProxyMiddleware({
  target: Env.ATS_SYSTEM_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/ats': '',
  }
}));

app.use(errorHandler);

app.listen(Env.PORT, async () => {
  console.log(`Server listening on port ${Env.PORT} in development`);
  console.log(`🔒 Security stack enabled with ${securityStack.length} protection layers`);
  await connectDatabase();
});
