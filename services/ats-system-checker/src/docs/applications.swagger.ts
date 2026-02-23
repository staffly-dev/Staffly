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
 *         description: Application details (includes quiz_score when the candidate took the quiz)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 application_id:
 *                   type: string
 *                   example: "9479e0cc-a84d-46ab-83c9-d55756fa5fc8"
 *                 candidate_email:
 *                   type: string
 *                 candidate_name:
 *                   type: string
 *                 cv_score:
 *                   type: number
 *                 cv_filename:
 *                   type: string
 *                   description: Full URL to the CV file
 *                 s3_key:
 *                   type: string
 *                 decision:
 *                   type: string
 *                   example: "ACCEPTED"
 *                 job_id:
 *                   type: string
 *                 quiz_score:
 *                   type: number
 *                   description: Quiz score (number of correct answers) when the candidate completed the quiz
 *                   example: 7
 *                 status:
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
 *   delete:
 *     summary: Delete application
 *     description: Delete an application by ID. Only the job owner can delete applications. Requires user_id (X-User-Id header or body).
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
 *         required: false
 *         schema:
 *           type: string
 *         description: User ID (24 character MongoDB ObjectId). Alternatively provide in request body.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: User ID (optional if X-User-Id header is set)
 *     responses:
 *       200:
 *         description: Application deleted successfully
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
 *                   example: "Application deleted successfully"
 *       400:
 *         description: Bad request (missing or invalid user_id)
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
 *       403:
 *         description: Forbidden (user does not own the job)
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
