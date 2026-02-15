/**
 * @swagger
 * /health:
 *   get:
 *     summary: System health check
 *     description: System health check endpoint
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
 *
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
 *
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

