/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance management endpoints for Staffly
 */

/**
 * @swagger
 * /attendance/checkin:
 *   post:
 *     tags:
 *       - Attendance
 *     summary: Record attendance check-in
 *     description: Records a check-in for an employee with optional custom check-in time.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *             properties:
 *               employeeId:
 *                 type: string
 *                 description: ID of the employee
 *                 example: 685edd9be63269894bc97cde
 *               checkInTime:
 *                 type: string
 *                 format: date-time
 *                 description: Optional custom check-in time
 *                 example: 2025-06-27T09:00:00.000Z
 *     responses:
 *       201:
 *         description: Attendance check-in recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Attendance created successfully
 *                 attendance:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 685edd9be63269894bc97cdf
 *                     employeeId:
 *                       type: string
 *                       example: 685edd9be63269894bc97cde
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-06-27T09:00:00.000Z
 *                     checkInTime:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-06-27T09:00:00.000Z
 *                     checkOutTime:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     status:
 *                       type: string
 *                       enum: [On Time, Late]
 *                       example: On Time
 *       400:
 *         description: Bad request - Invalid employee ID or check-in time
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: Employee not found
 */

/**
 * @swagger
 * /attendance:
 *   get:
 *     tags:
 *       - Attendance
 *     summary: Get all attendance records
 *     description: Retrieves all attendance records from the system.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
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
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 */

/**
 * @swagger
 * /attendance/search:
 *   get:
 *     tags:
 *       - Attendance
 *     summary: Search attendance records
 *     description: Search attendance records by employee first name and last name.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: firstName
 *         schema:
 *           type: string
 *         description: Employee first name to search for
 *         example: John
 *       - in: query
 *         name: lastName
 *         schema:
 *           type: string
 *         description: Employee last name to search for
 *         example: Doe
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
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
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 */

/**
 * @swagger
 * /attendance/getAllAttendance:
 *   get:
 *     tags:
 *       - Attendance
 *     summary: Get all attendance records
 *     description: Retrieves all attendance records from the system.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
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
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 */

/**
 * @swagger
 * /attendance/getAttendance/{id}:
 *   get:
 *     tags:
 *       - Attendance
 *     summary: Get attendance record by ID
 *     description: Retrieves a specific attendance record by its ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *         example: 685edd9be63269894bc97cdf
 *     responses:
 *       200:
 *         description: Attendance record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Attendance fetched successfully
 *                 attendance:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 685edd9be63269894bc97cdf
 *                     employeeId:
 *                       type: string
 *                       example: 685edd9be63269894bc97cde
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-06-27T09:00:00.000Z
 *                     checkInTime:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-06-27T09:00:00.000Z
 *                     checkOutTime:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     status:
 *                       type: string
 *                       enum: [On Time, Late]
 *                       example: On Time
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: Attendance record not found
 */ 