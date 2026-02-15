import { Router, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get(
  "/health",
  asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json({
      success: true,
      message: "ATS System is operational",
      data: {
        status: "healthy",
        version: "2.0.0",
        timestamp: new Date().toISOString()
      }
    });
  })
);

router.get(
  "/health/simple",
  asyncHandler(async (req: Request, res: Response) => {
    return res.status(200).json({
      status: "healthy",
      message: "ATS System is operational",
      version: "2.0.0"
    });
  })
);

export default router;

