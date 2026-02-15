/**
 * @swagger
 * /ats-checker/jobs:
 *   get:
 *     summary: Get all job postings
 *     description: Retrieve all job postings for the authenticated user
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         schema:
 *           type: string
 *         description: Bearer token
 *       - in: header
 *         name: X-User-Id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (24 character MongoDB ObjectId)
 *       - in: query
 *         name: include_inactive
 *         schema:
 *           type: boolean
 *         description: Include inactive jobs
 *     responses:
 *       200:
 *         description: List of job postings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       required_skills:
 *                         type: string
 *                       status:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *   post:
 *     summary: Create a new job posting
 *     description: Create a new job posting with the provided details
 *     tags: [Jobs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - access_token
 *               - user_id
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Senior Software Engineer"
 *               description:
 *                 type: string
 *                 example: "We are looking for an experienced software engineer"
 *               required_skills:
 *                 type: string
 *                 example: "JavaScript, TypeScript, Node.js"
 *               additional_details:
 *                 type: string
 *                 example: "Remote work available"
 *               hr_email:
 *                 type: string
 *                 format: email
 *                 example: "hr@company.com"
 *               hr_name:
 *                 type: string
 *                 example: "John Doe"
 *               user_id:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               created_by:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               owner_username:
 *                 type: string
 *                 example: "john_doe"
 *               access_token:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               evaluation_threshold:
 *                 type: number
 *                 default: 70
 *                 example: 70
 *               quiz_required:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *               quiz_pass_threshold:
 *                 type: number
 *                 default: 7
 *                 example: 7
 *     responses:
 *       201:
 *         description: Job posting created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *
 * /ats-checker/jobs/{job_id}:
 *   get:
 *     summary: Get a specific job posting
 *     description: Retrieve details of a specific job posting by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: job_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job posting ID
 *     responses:
 *       200:
 *         description: Job posting details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     required_skills:
 *                       type: string
 *                     status:
 *                       type: string
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *   put:
 *     summary: Update a job posting
 *     description: Update an existing job posting
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: job_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job posting ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               required_skills:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Job posting updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *   delete:
 *     summary: Delete a job posting
 *     description: Delete a job posting by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: job_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job posting ID
 *     responses:
 *       200:
 *         description: Job posting deleted
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
 *       404:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *
 * /ats-checker/jobs/{job_id}/apply:
 *   post:
 *     summary: Apply for a job
 *     description: Submit a job application with CV file
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: job_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job posting ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - cv_file
 *             properties:
 *               cv_file:
 *                 type: string
 *                 format: binary
 *                 description: CV file (PDF or DOCX)
 *               candidate_email:
 *                 type: string
 *                 format: email
 *                 example: "candidate@example.com"
 *               candidate_name:
 *                 type: string
 *                 example: "Jane Doe"
 *     responses:
 *       200:
 *         description: Application submitted successfully
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     application_id:
 *                       type: string
 *                     evaluation_score:
 *                       type: number
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 */
