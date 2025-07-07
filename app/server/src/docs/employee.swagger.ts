/**
 * @swagger
 * tags:
 *   name: Employee
 *   description: Employee management endpoints
 */

/**
 * @swagger
 * /employees:
 *   post:
 *     tags:
 *       - Employee
 *     summary: Create a new employee
 *     description: Adds a new employee to the system. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeInput'
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /employees:
 *   get:
 *     tags:
 *       - Employee
 *     summary: Get all employees
 *     description: Returns a list of all employees. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employees fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Employees fetched successfully
 *                 employees:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     tags:
 *       - Employee
 *     summary: Get an employee by ID
 *     description: Returns a single employee by their ID. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The employee ID
 *     responses:
 *       200:
 *         description: Employee fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */

/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     tags:
 *       - Employee
 *     summary: Update an employee
 *     description: Updates an employee's information. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeInput'
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */

/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     tags:
 *       - Employee
 *     summary: Delete an employee
 *     description: Deletes an employee by their ID. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The employee ID
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EmployeeResponse'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EmployeeInput:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - mobileNumber
 *         - emailAddress
 *         - dateOfBrith
 *         - maritalStatus
 *         - gender
 *         - nationality
 *         - address
 *         - city
 *         - state
 *         - zipcode
 *         - employessId
 *         - userName
 *         - employeeType
 *         - department
 *         - designation
 *         - workingDays
 *         - joiningAt
 *         - officeLocation
 *       properties:
 *         profilePicture:
 *           type: string
 *           nullable: true
 *           example: https://s3.amazonaws.com/bucket/profile.jpg
 *         firstName:
 *           type: string
 *           example: Brooklyn
 *         lastName:
 *           type: string
 *           example: Simmons
 *         mobileNumber:
 *           type: string
 *           example: "+1 555-123-4567"
 *         emailAddress:
 *           type: string
 *           format: email
 *           example: brooklyn.simmons@example.com
 *         dateOfBrith:
 *           type: string
 *           format: date
 *           example: 1990-01-01
 *         maritalStatus:
 *           type: string
 *           example: Single
 *         gender:
 *           type: string
 *           example: Female
 *         nationality:
 *           type: string
 *           example: American
 *         address:
 *           type: string
 *           example: "324 Royal Ln, Mesa, New Jersey"
 *         city:
 *           type: string
 *           example: Mesa
 *         state:
 *           type: string
 *           example: New Jersey
 *         zipcode:
 *           type: string
 *           example: "45463"
 *         employessId:
 *           type: string
 *           example: "EMP12345"
 *         userName:
 *           type: string
 *           example: brooklyn_simmons
 *         employeeType:
 *           type: string
 *           example: Full-time
 *         department:
 *           type: string
 *           example: Engineering
 *         designation:
 *           type: string
 *           example: Project Manager
 *         workingDays:
 *           type: string
 *           example: "Monday-Friday"
 *         joiningAt:
 *           type: string
 *           format: date
 *           example: 2022-07-19
 *         officeLocation:
 *           type: string
 *           example: "New York HQ"
 *         employeeCv:
 *           type: string
 *           nullable: true
 *           example: https://s3.amazonaws.com/bucket/cv.pdf
 *         slackId:
 *           type: string
 *           example: brooklyn_simmons
 *         linkdeinId:
 *           type: string
 *           example: brooklyn_simmons
 *         githubId:
 *           type: string
 *           example: brooklyn_simmons
 *     Employee:
 *       allOf:
 *         - $ref: '#/components/schemas/EmployeeInput'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: 685edd9be63269894bc97cde
 *             createdAt:
 *               type: string
 *               format: date-time
 *               example: 2025-06-27T18:06:19.406Z
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               example: 2025-06-27T18:06:19.406Z
 *     EmployeeResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Employee created successfully
 *         employee:
 *           $ref: '#/components/schemas/Employee'
 */