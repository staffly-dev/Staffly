import { Router, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

/**
 * @swagger
 * /ats-checker/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns detailed health status of the ATS System
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System is operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "ATS System is operational"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "healthy"
 *                     version:
 *                       type: string
 *                       example: "2.0.0"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */
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

/**
 * @swagger
 * /ats-checker/health/simple:
 *   get:
 *     summary: Simple health check endpoint
 *     description: Returns a simple health status response
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System is operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 message:
 *                   type: string
 *                   example: "ATS System is operational"
 *                 version:
 *                   type: string
 *                   example: "2.0.0"
 */
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

