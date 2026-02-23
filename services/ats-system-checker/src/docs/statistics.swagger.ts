/**
 * @swagger
 * /ats-checker/statistics:
 *   get:
 *     summary: Get general statistics
 *     description: Retrieve general system statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Statistics data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_jobs:
 *                   type: number
 *                   example: 150
 *                 active_jobs:
 *                   type: number
 *                   example: 120
 *                 total_applications:
 *                   type: number
 *                   example: 500
 *                 total_quizzes:
 *                   type: number
 *                   example: 300
 *                 average_evaluation_score:
 *                   type: number
 *                   example: 75.5
 *
 * /ats-checker/statistics/applications:
 *   get:
 *     summary: Application statistics
 *     description: Get statistics about job applications
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Application statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_applications:
 *                   type: number
 *                   example: 500
 *                 pending_applications:
 *                   type: number
 *                   example: 150
 *                 accepted_applications:
 *                   type: number
 *                   example: 200
 *                 rejected_applications:
 *                   type: number
 *                   example: 150
 *                 average_evaluation_score:
 *                   type: number
 *                   example: 75.5
 *
 * /ats-checker/statistics/jobs:
 *   get:
 *     summary: Job posting statistics
 *     description: Get statistics about job postings
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Job statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_jobs:
 *                   type: number
 *                   example: 150
 *                 active_jobs:
 *                   type: number
 *                   example: 120
 *                 inactive_jobs:
 *                   type: number
 *                   example: 30
 *                 jobs_by_status:
 *                   type: object
 *                   properties:
 *                     active:
 *                       type: number
 *                     inactive:
 *                       type: number
 *
 * /ats-checker/statistics/quiz:
 *   get:
 *     summary: Quiz performance statistics
 *     description: Get statistics about quiz performance
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Quiz statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total_quizzes:
 *                   type: number
 *                   example: 300
 *                 passed_quizzes:
 *                   type: number
 *                   example: 200
 *                 failed_quizzes:
 *                   type: number
 *                   example: 100
 *                 average_score:
 *                   type: number
 *                   example: 75.5
 *                 pass_rate:
 *                   type: number
 *                   example: 66.67
 *
 * /ats-checker/user-statistics:
 *   get:
 *     summary: Get user statistics
 *     description: Retrieve statistics for the authenticated user (via X-User-Id). Returns totals and rates for applications, evaluations, and quiz.
 *     tags: [Statistics]
 *     parameters:
 *       - in: header
 *         name: X-User-Id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID (24 character MongoDB ObjectId) - statistics are returned for this user
 *       - in: header
 *         name: X-Created-By
 *         required: false
 *         schema:
 *           type: string
 *         description: Created by user ID (optional, defaults to X-User-Id)
 *     responses:
 *       200:
 *         description: User statistics for the given user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   example: "699b2eadee07dc8bae1ae233"
 *                 created_by:
 *                   type: string
 *                   example: "699b2eadee07dc8bae1ae233"
 *                 total_applications:
 *                   type: number
 *                   example: 2
 *                 total_evaluations:
 *                   type: number
 *                   example: 0
 *                 acceptance_rate:
 *                   type: number
 *                   example: 0
 *                 average_score:
 *                   type: number
 *                   example: 0
 *                 quiz_pass_rate:
 *                   type: number
 *                   example: 0
 *                 daily_stats:
 *                   type: object
 *                   additionalProperties: true
 *                   example: {}
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
 *       403:
 *         description: Forbidden
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
