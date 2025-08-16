/**
 * @swagger
 * tags:
 *   name: Payroll
 *   description: Payroll management endpoints for Staffly
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Payroll:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: 685edd9be63269894bc97cde
 *         employeeId:
 *           type: string
 *           example: 685edd9be63269894bc97cdf
 *         ctc:
 *           type: string
 *           example: "60000"
 *         salaryByMonth:
 *           type: string
 *           example: "5000"
 *         deduction:
 *           type: string
 *           example: "500"
 *         status:
 *           type: string
 *           enum: [completed, pending]
 *           example: pending
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: 2025-06-27T18:06:19.406Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: 2025-06-27T18:06:19.406Z
 *     CreatePayrollRequest:
 *       type: object
 *       required:
 *         - employeeId
 *         - ctc
 *         - salaryByMonth
 *       properties:
 *         employeeId:
 *           type: string
 *           description: ID of the employee
 *           example: 685edd9be63269894bc97cdf
 *         ctc:
 *           type: string
 *           description: Cost to Company (CTC)
 *           example: "60000"
 *         salaryByMonth:
 *           type: string
 *           description: Monthly salary amount
 *           example: "5000"
 *         deduction:
 *           type: string
 *           description: Deduction amount (optional)
 *           example: "500"
 *     UpdatePayrollRequest:
 *       type: object
 *       properties:
 *         employeeId:
 *           type: string
 *           description: ID of the employee
 *           example: 685edd9be63269894bc97cdf
 *         ctc:
 *           type: string
 *           description: Cost to Company (CTC)
 *           example: "65000"
 *         salaryByMonth:
 *           type: string
 *           description: Monthly salary amount
 *           example: "5500"
 *         deduction:
 *           type: string
 *           description: Deduction amount
 *           example: "600"
 */

/**
 * @swagger
 * /payroll/createPayroll:
 *   post:
 *     tags:
 *       - Payroll
 *     summary: Create a new payroll record
 *     description: Creates a new payroll record for an employee with CTC, monthly salary, and optional deductions.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePayrollRequest'
 *     responses:
 *       201:
 *         description: Payroll created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payroll created successfully
 *                 payroll:
 *                   $ref: '#/components/schemas/Payroll'
 *       400:
 *         description: Validation error or invalid employee ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation error
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /payroll/search:
 *   get:
 *     tags:
 *       - Payroll
 *     summary: Search payroll records by employee name
 *     description: Searches payroll records by employee first name and/or last name.
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
 *         description: Payroll records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payroll fetched successfully
 *                 payroll:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payroll'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /payroll/getAllPayroll:
 *   get:
 *     tags:
 *       - Payroll
 *     summary: Get all payroll records
 *     description: Retrieves all payroll records from the system.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payroll records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payroll fetched successfully
 *                 payroll:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payroll'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /payroll/updatePayroll/{id}:
 *   put:
 *     tags:
 *       - Payroll
 *     summary: Update a payroll record
 *     description: Updates an existing payroll record with new information.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll record ID
 *         example: 685edd9be63269894bc97cde
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePayrollRequest'
 *     responses:
 *       200:
 *         description: Payroll updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payroll updated successfully
 *                 payroll:
 *                   $ref: '#/components/schemas/Payroll'
 *       400:
 *         description: Validation error or invalid payroll ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation error
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Payroll record not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /payroll/deletePayroll/{id}:
 *   delete:
 *     tags:
 *       - Payroll
 *     summary: Delete a payroll record
 *     description: Permanently deletes a payroll record from the system.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payroll record ID
 *         example: 685edd9be63269894bc97cde
 *     responses:
 *       200:
 *         description: Payroll deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Payroll deleted successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Payroll record not found
 *       500:
 *         description: Internal server error
 */ 