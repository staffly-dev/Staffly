/**
 * @swagger
 * /ats-checker/s3/upload:
 *   post:
 *     summary: Upload file to S3
 *     description: Upload a file (PDF or DOCX) to AWS S3 bucket
 *     tags: [AWS S3]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload (PDF or DOCX, max size 10MB)
 *     responses:
 *       200:
 *         description: File uploaded successfully
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
 *                   example: "File uploaded successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     s3_key:
 *                       type: string
 *                       example: "uploads/file123.pdf"
 *                     url:
 *                       type: string
 *                       example: "https://bucket.s3.amazonaws.com/uploads/file123.pdf"
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
 * /ats-checker/s3/status:
 *   get:
 *     summary: Check S3 status
 *     description: Check AWS S3 connection status
 *     tags: [AWS S3]
 *     responses:
 *       200:
 *         description: S3 status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 connected:
 *                   type: boolean
 *                   example: true
 *                 bucket:
 *                   type: string
 *                   example: "my-bucket"
 *                 region:
 *                   type: string
 *                   example: "us-east-1"
 *
 * /ats-checker/s3/debug:
 *   get:
 *     summary: Debug S3 status
 *     description: Get detailed S3 connection and configuration information
 *     tags: [AWS S3]
 *     responses:
 *       200:
 *         description: S3 debug information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 connected:
 *                   type: boolean
 *                 bucket:
 *                   type: string
 *                 region:
 *                   type: string
 *                 config:
 *                   type: object
 *
 * /ats-checker/s3/{s3_key}:
 *   delete:
 *     summary: Delete file from S3
 *     description: Delete a file from AWS S3 bucket by key
 *     tags: [AWS S3]
 *     parameters:
 *       - in: path
 *         name: s3_key
 *         required: true
 *         schema:
 *           type: string
 *         description: S3 file key (supports wildcards with *)
 *     responses:
 *       200:
 *         description: File deleted successfully
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
 *                   example: "File deleted successfully"
 *       404:
 *         description: File not found
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
 * /ats-checker/s3/presign/{s3_key}:
 *   get:
 *     summary: Get presigned URL
 *     description: Get a presigned URL for temporary S3 file access
 *     tags: [AWS S3]
 *     parameters:
 *       - in: path
 *         name: s3_key
 *         required: true
 *         schema:
 *           type: string
 *         description: S3 file key
 *       - in: query
 *         name: expiresIn
 *         schema:
 *           type: integer
 *           default: 3600
 *         description: URL expiration time in seconds (default 1 hour)
 *     responses:
 *       200:
 *         description: Presigned URL generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 url:
 *                   type: string
 *                   example: "https://bucket.s3.amazonaws.com/uploads/file123.pdf?X-Amz-Algorithm=..."
 *                 expires_in:
 *                   type: integer
 *                   example: 3600
 *       404:
 *         description: File not found
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
 * /ats-checker/s3/file/{s3_key}:
 *   get:
 *     summary: Download file from S3
 *     description: Download a file from AWS S3 bucket
 *     tags: [AWS S3]
 *     parameters:
 *       - in: path
 *         name: s3_key
 *         required: true
 *         schema:
 *           type: string
 *         description: S3 file key
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
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
