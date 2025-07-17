/**
 * @swagger
 * tags:
 *   name: Employee
 *   description: Employee management endpoints
 */

/**
 * @swagger
 * /employees/addEmployee:
 *   post:
 *     tags:
 *       - Employee
 *     summary: Add Employee
 *     description: Creates a new employee in the system. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 example: "https://s3.amazonaws.com/bucket/profile.jpg"
 *               firstName:
 *                 type: string
 *                 example: "Ahmed"
 *               lastName:
 *                 type: string
 *                 example: "Badawi"
 *               mobileNumber:
 *                 type: string
 *                 example: "+201018562905"
 *               emailAddress:
 *                 type: string
 *                 format: email
 *                 example: "ahmed@badawi.com"
 *               dateOfBrith:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               maritalStatus:
 *                 type: string
 *                 example: "Single"
 *               gender:
 *                 type: string
 *                 example: "Male"
 *               nationality:
 *                 type: string
 *                 example: "American"
 *               address:
 *                 type: string
 *                 example: "324 Royal Ln, Mesa, New Jersey"
 *               city:
 *                 type: string
 *                 example: "Mesa"
 *               state:
 *                 type: string
 *                 example: "New Jersey"
 *               zipcode:
 *                 type: string
 *                 example: "45463"
 *               employeeId:
 *                 type: string
 *                 example: "ABE12345"
 *               userName:
 *                 type: string
 *                 example: "ahmed_badawi"
 *               employeeType:
 *                 type: string
 *                 example: "Full-time"
 *               department:
 *                 type: string
 *                 example: "Engineering"
 *               designation:
 *                 type: string
 *                 example: "Project Manager"
 *               workingDays:
 *                 type: string
 *                 example: "Monday-Friday"
 *               joiningAt:
 *                 type: string
 *                 format: date
 *                 example: "2022-07-19"
 *               officeLocation:
 *                 type: string
 *                 example: "New York HQ"
 *               employeeCv:
 *                 type: string
 *                 example: "https://s3.amazonaws.com/bucket/cv.pdf"
 *               linkdeinLink:
 *                 type: string
 *                 example: "brooklyn_simmons"
 *               githubLink:
 *                 type: string
 *                 example: "brooklyn_simmons"
 *               slackUserName:
 *                 type: string
 *                 example: "brooklyn_simmons"
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Employee created successfully"
 *                 employee:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /employees/getAllEmployees:
 *   get:
 *     tags:
 *       - Employee
 *     summary: Get All Employees
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
 *                   example: "Employees fetched successfully"
 *                 employees:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Employee'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /employees/getEmployee/{id}:
 *   get:
 *     tags:
 *       - Employee
 *     summary: Get Employee By ID
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
 *         example: "686a2aba2bcf79010745f38a"
 *     responses:
 *       200:
 *         description: Employee fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Employee fetched successfully"
 *                 employee:
 *                   $ref: '#/components/schemas/Employee'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */

/**
 * @swagger
 * /employees/updateEmployee/{id}:
 *   put:
 *     tags:
 *       - Employee
 *     summary: Update Employee By ID
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
 *         example: "686a2aba2bcf79010745f38a"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 example: "https://s3.amazonaws.com/bucket/profile.jpg"
 *               firstName:
 *                 type: string
 *                 example: "Ahmed"
 *               lastName:
 *                 type: string
 *                 example: "Badawi"
 *               mobileNumber:
 *                 type: string
 *                 example: "+201018562905"
 *               emailAddress:
 *                 type: string
 *                 format: email
 *                 example: "ahmed@badawi.com"
 *               dateOfBrith:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               maritalStatus:
 *                 type: string
 *                 example: "Single"
 *               gender:
 *                 type: string
 *                 example: "male"
 *               nationality:
 *                 type: string
 *                 example: "American"
 *               address:
 *                 type: string
 *                 example: "324 Royal Ln, Mesa, New Jersey"
 *               city:
 *                 type: string
 *                 example: "Mesa"
 *               state:
 *                 type: string
 *                 example: "New Jersey"
 *               zipcode:
 *                 type: string
 *                 example: "45463"
 *               employessId:
 *                 type: string
 *                 example: "ABE12345"
 *               userName:
 *                 type: string
 *                 example: "ahmed_badawi"
 *               employeeType:
 *                 type: string
 *                 example: "part-time"
 *               department:
 *                 type: string
 *                 example: "Engineering"
 *               designation:
 *                 type: string
 *                 example: "Project Manager"
 *               workingDays:
 *                 type: string
 *                 example: "Monday-Friday"
 *               joiningAt:
 *                 type: string
 *                 format: date
 *                 example: "2022-07-19"
 *               officeLocation:
 *                 type: string
 *                 example: "New York HQ"
 *               employeeCv:
 *                 type: string
 *                 example: "https://s3.amazonaws.com/bucket/cv.pdf"
 *               slackId:
 *                 type: string
 *                 example: "brooklyn_simmons"
 *               linkdeinId:
 *                 type: string
 *                 example: "brooklyn_simmons"
 *               githubId:
 *                 type: string
 *                 example: "brooklyn_simmons"
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Employee updated successfully"
 *                 employee:
 *                   $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */

/**
 * @swagger
 * /employees/deleteEmployee/{id}:
 *   delete:
 *     tags:
 *       - Employee
 *     summary: Delete Employee By ID
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
 *         example: "686a2aba2bcf79010745f38a"
 *     responses:
 *       200:
 *         description: Employee deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Employee deleted successfully"
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Employee not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Employee:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "686a2aba2bcf79010745f38a"
 *         profilePicture:
 *           type: string
 *           nullable: true
 *           example: "https://s3.amazonaws.com/bucket/profile.jpg"
 *         firstName:
 *           type: string
 *           example: "Ahmed"
 *         lastName:
 *           type: string
 *           example: "Badawi"
 *         mobileNumber:
 *           type: string
 *           example: "+201018562905"
 *         emailAddress:
 *           type: string
 *           format: email
 *           example: "ahmed@badawi.com"
 *         dateOfBrith:
 *           type: string
 *           format: date
 *           example: "1990-01-01"
 *         maritalStatus:
 *           type: string
 *           example: "Single"
 *         gender:
 *           type: string
 *           example: "Female"
 *         nationality:
 *           type: string
 *           example: "American"
 *         address:
 *           type: string
 *           example: "324 Royal Ln, Mesa, New Jersey"
 *         city:
 *           type: string
 *           example: "Mesa"
 *         state:
 *           type: string
 *           example: "New Jersey"
 *         zipcode:
 *           type: string
 *           example: "45463"
 *         employessId:
 *           type: string
 *           example: "ABE12345"
 *         userName:
 *           type: string
 *           example: "ahmed_badawi"
 *         employeeType:
 *           type: string
 *           example: "Full-time"
 *         department:
 *           type: string
 *           example: "Engineering"
 *         designation:
 *           type: string
 *           example: "Project Manager"
 *         workingDays:
 *           type: string
 *           example: "Monday-Friday"
 *         joiningAt:
 *           type: string
 *           format: date
 *           example: "2022-07-19"
 *         officeLocation:
 *           type: string
 *           example: "New York HQ"
 *         employeeCv:
 *           type: string
 *           nullable: true
 *           example: "https://s3.amazonaws.com/bucket/cv.pdf"
 *         slackId:
 *           type: string
 *           example: "brooklyn_simmons"
 *         linkdeinId:
 *           type: string
 *           example: "brooklyn_simmons"
 *         githubId:
 *           type: string
 *           example: "brooklyn_simmons"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-27T18:06:19.406Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-06-27T18:06:19.406Z"
 */