import { Router, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { get_database_service } from "../utils/dependencies";
import { StatisticsController } from "../controllers/statistics.controller";
import { jwt_utils } from "../utils/jwt_utils";
import { verify_user_exists_and_token_valid } from "../utils/gateway_client";

const router = Router();

router.get(
  "/statistics",
  asyncHandler(async (req: Request, res: Response) => {
    const databaseService = get_database_service(req);
    const controller = new StatisticsController(databaseService);
    const stats = await controller.get_statistics();
    return res.status(200).json(stats);
  })
);

router.get(
  "/user-statistics",
  asyncHandler(async (req: Request, res: Response) => {
    const authorization = req.headers.authorization;
    const x_user_id = req.headers["x-user-id"] as string;
    const x_created_by = req.headers["x-created-by"] as string;

    // Validate token
    if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Missing or invalid Authorization header"
      });
    }

    let access_token = authorization.split(" ", 2)[1];
    access_token = access_token.trim().replace(/^["']|["']$/g, "");
    if (access_token.toLowerCase().startsWith("bearer ")) {
      access_token = access_token.split(" ", 2)[1].trim();
    }

    try {
      jwt_utils.decode_token(access_token);
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Invalid token"
      });
    }

    // Require user id
    if (!x_user_id) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "X-User-Id header is required"
      });
    }

    // Validate user_id format
    if (x_user_id.length !== 24 || !/^[0-9a-f]{24}$/i.test(x_user_id)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid user_id format"
      });
    }

    // Verify user exists
    try {
      await verify_user_exists_and_token_valid(x_user_id, access_token);
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: true,
        message: error.message || "User verification failed"
      });
    }

    // Validate created_by
    if (x_created_by && x_created_by !== x_user_id) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "created_by must match user_id"
      });
    }

    const created_by = x_created_by || x_user_id;
    const databaseService = get_database_service(req);
    const controller = new StatisticsController(databaseService);
    const stats = await controller.get_user_statistics(x_user_id, created_by);
    
    return res.status(200).json(stats);
  })
);

export default router;

