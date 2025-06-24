import "dotenv/config";
import cors from "cors";
import express, { Request, Response, NextFunction } from 'express';
import { asyncHandler } from "./middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { Env } from "./config/env.config";
import connectDatabase from "./config/database.config";

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

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

app.use(errorHandler);

app.listen(Env.PORT, async () => {
  console.log(`Server listening on port ${Env.PORT} in ${Env.NODE_ENV}`);
  await connectDatabase();
});