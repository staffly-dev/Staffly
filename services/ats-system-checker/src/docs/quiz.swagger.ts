/**
 * @swagger
 * /ats-checker/quiz/submit:
 *   post:
 *     summary: Submit quiz answers
 *     description: Submit quiz answers for evaluation
 *     tags: [Quiz]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - answers
 *               - quiz_session_id
 *               - email
 *             properties:
 *               answers:
 *                 type: array
 *                 description: Array of quiz answers
 *                 items:
 *                   type: object
 *                   properties:
 *                     question_id:
 *                       type: string
 *                     answer:
 *                       type: string
 *                 example:
 *                   - question_id: "q1"
 *                     answer: "Option A"
 *                   - question_id: "q2"
 *                     answer: "Option B"
 *               quiz_session_id:
 *                 type: string
 *                 description: Quiz session ID
 *                 example: "507f1f77bcf86cd799439011"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Candidate email
 *                 example: "candidate@example.com"
 *     responses:
 *       200:
 *         description: Quiz submitted and evaluated
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
 *                     quiz_session_id:
 *                       type: string
 *                     score:
 *                       type: number
 *                     total_questions:
 *                       type: number
 *                     passed:
 *                       type: boolean
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
 * /ats-checker/quiz/users:
 *   get:
 *     summary: List quiz participants
 *     description: List all quiz participants
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: false
 *         schema:
 *           type: string
 *         description: Bearer token (optional if provided in body)
 *       - in: header
 *         name: X-User-Id
 *         required: false
 *         schema:
 *           type: string
 *         description: User ID (optional if provided in body)
 *     responses:
 *       200:
 *         description: List of quiz participants
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
 *                       email:
 *                         type: string
 *                       quiz_session_id:
 *                         type: string
 *                       score:
 *                         type: number
 *                       passed:
 *                         type: boolean
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
 *   post:
 *     summary: Get all quiz users
 *     description: Retrieve all users who have taken quizzes
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: false
 *         schema:
 *           type: string
 *         description: Bearer token (optional if provided in body)
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
 *               access_token:
 *                 type: string
 *                 description: Bearer token
 *               user_id:
 *                 type: string
 *                 description: User ID (24 character MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: List of quiz users
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
 *                       email:
 *                         type: string
 *                       quiz_session_id:
 *                         type: string
 *                       score:
 *                         type: number
 *                       passed:
 *                         type: boolean
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
 * /ats-checker/quiz/{session_id}:
 *   get:
 *     summary: Get quiz questions
 *     description: Get quiz questions by session ID
 *     tags: [Quiz]
 *     parameters:
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz session ID
 *     responses:
 *       200:
 *         description: Quiz questions retrieved successfully
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
 *                     session_id:
 *                       type: string
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           question_id:
 *                             type: string
 *                           question:
 *                             type: string
 *                           options:
 *                             type: array
 *                             items:
 *                               type: string
 *       404:
 *         description: Quiz not found
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
