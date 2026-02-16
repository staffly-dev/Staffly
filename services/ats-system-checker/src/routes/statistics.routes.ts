import { Router, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { get_database_service } from "../utils/dependencies";
import { StatisticsController } from "../controllers/statistics.controller";

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
    const x_user_id = req.headers["x-user-id"] as string;
    const x_created_by = req.headers["x-created-by"] as string;

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

