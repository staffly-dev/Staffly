/**
 * @swagger
 * /ats-checker/applications:
 *   get:
 *     summary: List all applications
 *     description: Retrieve all job applications for the authenticated user
 *     tags: [Applications]
 *     parameters:
 *       - in: header
 *         name: X-User-Id
 *         required: false
 *         schema:
 *           type: string
 *         description: User ID (optional if provided in body)
 *     responses:
 *       200:
 *         description: List of applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       job_id:
 *                         type: string
 *                       candidate_email:
 *                         type: string
 *                       candidate_name:
 *                         type: string
 *                       status:
 *                         type: string
 *                       evaluation_score:
 *                         type: number
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
 *     summary: Get all applications (POST method)
 *     description: Retrieve all job applications for the authenticated user using POST
 *     tags: [Applications]
 *     parameters:
 *       - in: header
 *         name: X-User-Id
 *         required: false
 *         schema:
 *           type: string
 *         description: User ID (optional if provided in body)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: User ID (24 character MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: List of applications
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       job_id:
 *                         type: string
 *                       candidate_email:
 *                         type: string
 *                       candidate_name:
 *                         type: string
 *                       status:
 *                         type: string
 *                       evaluation_score:
 *                         type: number
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
 *
 * /ats-checker/applications/{app_id}:
 *   get:
 *     summary: Get application by ID
 *     description: Retrieve a specific application by its ID
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: app_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application details
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
 *                     job_id:
 *                       type: string
 *                     candidate_email:
 *                       type: string
 *                     candidate_name:
 *                       type: string
 *                     cv_file_url:
 *                       type: string
 *                     status:
 *                       type: string
 *                     evaluation_score:
 *                       type: number
 *                     quiz_score:
 *                       type: number
 *       404:
 *         description: Application not found
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
 * /ats-checker/applications/{app_id}/schedule-interview:
 *   post:
 *     summary: Schedule interview
 *     description: Schedule an interview for a specific application
 *     tags: [Applications]
 *     parameters:
 *       - in: path
 *         name: app_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *       - in: header
 *         name: X-User-Id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (24 character MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - interview_date
 *               - interview_time
 *             properties:
 *               interview_date:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-25"
 *                 description: Interview date (YYYY-MM-DD)
 *               interview_time:
 *                 type: string
 *                 format: time
 *                 example: "14:00"
 *                 description: Interview time (HH:MM)
 *               interview_type:
 *                 type: string
 *                 enum: [in-person, video, phone]
 *                 example: "video"
 *                 description: Type of interview
 *               location:
 *                 type: string
 *                 example: "Zoom Meeting Room"
 *                 description: Interview location or meeting link
 *               notes:
 *                 type: string
 *                 example: "Technical interview with senior engineer"
 *                 description: Additional notes about the interview
 *     responses:
 *       200:
 *         description: Interview scheduled successfully
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
 *                   example: "Interview scheduled successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     interview_id:
 *                       type: string
 *                     app_id:
 *                       type: string
 *                     interview_date:
 *                       type: string
 *                     interview_time:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: "scheduled"
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
 *       404:
 *         description: Application not found
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
 */
