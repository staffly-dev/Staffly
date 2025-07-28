/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard management endpoints for Staffly
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get dashboard overview
 *     description: Retrieves dashboard overview including total employees, total attendance, total applicants, and total projects.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dashboard fetched successfully
 *                 dashboard:
 *                   type: object
 *                   properties:
 *                     totalEmployees:
 *                       type: number
 *                       description: Total number of employees
 *                       example: 150
 *                     totalAttendance:
 *                       type: number
 *                       description: Total attendance records
 *                       example: 1250
 *                     totalApplicants:
 *                       type: number
 *                       description: Total number of job applicants
 *                       example: 75
 *                     totalProjects:
 *                       type: number
 *                       description: Total number of active projects
 *                       example: 12
 *                     recentActivity:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: attendance
 *                           description:
 *                             type: string
 *                             example: John Doe checked in
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-06-27T09:00:00.000Z
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 */

/**
 * @swagger
 * /dashboard/attendance:
 *   get:
 *     tags:
 *       - Dashboard
 *     summary: Get all attendance for dashboard
 *     description: Retrieves all attendance records specifically formatted for dashboard display.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Attendance fetched successfully
 *                 attendance:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 685edd9be63269894bc97cdf
 *                       employeeId:
 *                         type: string
 *                         example: 685edd9be63269894bc97cde
 *                       employeeName:
 *                         type: string
 *                         example: John Doe
 *                       date:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-06-27T09:00:00.000Z
 *                       checkInTime:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-06-27T09:00:00.000Z
 *                       checkOutTime:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       status:
 *                         type: string
 *                         enum: [On Time, Late]
 *                         example: On Time
 *                       department:
 *                         type: string
 *                         example: Engineering
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 */ 