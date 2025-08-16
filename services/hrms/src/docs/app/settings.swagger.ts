/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: User settings management endpoints for Staffly
 */

/**
 * @swagger
 * /settings/getSettings/{userId}:
 *   get:
 *     tags:
 *       - Settings
 *     summary: Get user settings
 *     description: Retrieves settings for a specific user by their user ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to get settings for
 *         example: 685edd9be63269894bc97cde
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Settings fetched successfully
 *                 settings:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 685edd9be63269894bc97cdf
 *                     userId:
 *                       type: string
 *                       example: 685edd9be63269894bc97cde
 *                     appearance:
 *                       type: string
 *                       enum: [light, dark]
 *                       description: User interface appearance preference
 *                       example: light
 *                     language:
 *                       type: string
 *                       description: User's preferred language
 *                       example: en
 *                     emailNotifications:
 *                       type: boolean
 *                       description: Whether email notifications are enabled
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-06-27T18:06:19.406Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-06-27T18:06:19.406Z
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: Settings not found for the specified user
 */

/**
 * @swagger
 * /settings/updateSettings/{userId}:
 *   put:
 *     tags:
 *       - Settings
 *     summary: Update user settings
 *     description: Updates settings for a specific user by their user ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID to update settings for
 *         example: 685edd9be63269894bc97cde
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               appearance:
 *                 type: string
 *                 enum: [light, dark]
 *                 description: User interface appearance preference
 *                 example: dark
 *               language:
 *                 type: string
 *                 description: User's preferred language
 *                 example: es
 *               emailNotifications:
 *                 type: boolean
 *                 description: Whether email notifications are enabled
 *                 example: false
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Settings updated successfully
 *                 settings:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 685edd9be63269894bc97cdf
 *                     userId:
 *                       type: string
 *                       example: 685edd9be63269894bc97cde
 *                     appearance:
 *                       type: string
 *                       enum: [light, dark]
 *                       description: User interface appearance preference
 *                       example: dark
 *                     language:
 *                       type: string
 *                       description: User's preferred language
 *                       example: es
 *                     emailNotifications:
 *                       type: boolean
 *                       description: Whether email notifications are enabled
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-06-27T18:06:19.406Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-06-27T18:06:19.406Z
 *       400:
 *         description: Bad request - Invalid settings data
 *       401:
 *         description: Unauthorized - Invalid or missing authentication token
 *       404:
 *         description: Settings not found for the specified user
 */ 