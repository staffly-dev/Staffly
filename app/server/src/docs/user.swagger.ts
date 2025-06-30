/**
 * @swagger
 * tags:
 *   name: User
 *   description: User endpoints
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags:
 *       - User
 *     summary: Get current authenticated user
 *     description: Returns the authenticated user's information. Requires a valid access token in the `Authorization` header.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Current user fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 685edd9be63269894bc97cde
 *                     name:
 *                       type: string
 *                       example: Test User
 *                     email:
 *                       type: string
 *                       example: testemail@gmail.com
 *                     profilePicture:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     isVerified:
 *                       type: boolean
 *                       example: true
 *                     role:
 *                       type: string
 *                       example: user
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     lastLogin:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-06-27T18:07:36.696Z
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-06-27T18:06:19.406Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-06-27T18:07:36.697Z
 *       401:
 *         description: Unauthorized - missing or invalid token
 */
