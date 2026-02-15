import { Router, Request, Response } from "express";
import multer from "multer";
import { asyncHandler } from "../utils/asyncHandler";
import { get_database_service, get_evaluation_service, get_s3_service } from "../utils/dependencies";
import { JobController } from "../controllers/job.controller";
import { jwt_utils } from "../utils/jwt_utils";
import { verify_user_exists_and_token_valid } from "../utils/gateway_client";
import { Env } from "../config/env.config";
import path from "path";

const router = Router();
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: Env.MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if ([".pdf", ".docx"].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are allowed"));
    }
  }
});

router.get(
  "/jobs",
  asyncHandler(async (req: Request, res: Response) => {
    const authorization = req.headers.authorization;
    const x_user_id = req.headers["x-user-id"] as string;
    const include_inactive = req.query.include_inactive === "true";

    // Validate token
    if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Missing or invalid Authorization header"
      });
    }

    let access_token = authorization.split(" ", 2)[1];
    access_token = access_token.trim().replace(/^["']|["']$/g, "");
    if (access_token.toLowerCase().startsWith("bearer ")) {
      access_token = access_token.split(" ", 2)[1].trim();
    }

    try {
      jwt_utils.decode_token(access_token);
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Invalid token"
      });
    }

    // Require user id
    if (!x_user_id) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "X-User-Id header is required"
      });
    }

    // Validate user_id format
    if (x_user_id.length !== 24 || !/^[0-9a-f]{24}$/i.test(x_user_id)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid user_id format"
      });
    }

    // Verify user exists
    try {
      await verify_user_exists_and_token_valid(x_user_id, access_token);
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: true,
        message: error.message || "User verification failed"
      });
    }

    const x_created_by = req.headers["x-created-by"] as string;
    if (x_created_by && x_created_by !== x_user_id) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "created_by must match user_id"
      });
    }

    const databaseService = get_database_service(req);
    const evaluationService = get_evaluation_service(req);
    const s3Service = get_s3_service(req);
    const controller = new JobController(databaseService, evaluationService, s3Service);
    
    // Note: get_all_job_postings needs to support filtering by owner_user_id
    return await controller.get_all_job_postings(req, res);
  })
);

router.post(
  "/jobs",
  upload.none(), // Accept form data without files
  asyncHandler(async (req: Request, res: Response) => {
    const {
      title,
      description,
      required_skills,
      additional_details,
      hr_email,
      hr_name,
      user_id,
      created_by,
      owner_username,
      access_token,
      evaluation_threshold = 70,
      quiz_required = true,
      quiz_pass_threshold = 7
    } = req.body;

    // Validate token
    if (!access_token) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "access_token is required in form-data"
      });
    }

    let token_candidate = access_token.trim().replace(/^["']|["']$/g, "");
    if (token_candidate.toLowerCase().startsWith("bearer ")) {
      token_candidate = token_candidate.split(" ", 2)[1].trim();
    }

    // Require user_id
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "user_id is required in form-data"
      });
    }

    // Validate user_id format
    if (user_id.length !== 24 || !/^[0-9a-f]{24}$/i.test(user_id)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid user_id format"
      });
    }

    // Verify user exists
    try {
      await verify_user_exists_and_token_valid(user_id, token_candidate);
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: true,
        message: error.message || "User verification failed"
      });
    }

    const databaseService = get_database_service(req);
    const evaluationService = get_evaluation_service(req);
    const s3Service = get_s3_service(req);
    const controller = new JobController(databaseService, evaluationService, s3Service);
    
    // Set owner_user_id from verified user_id
    req.body.owner_user_id = user_id;
    req.body.owner_username = owner_username;
    
    return await controller.create_job_posting(req, res);
  })
);

router.get(
  "/jobs/:job_id",
  asyncHandler(async (req: Request, res: Response) => {
    const databaseService = get_database_service(req);
    const evaluationService = get_evaluation_service(req);
    const s3Service = get_s3_service(req);
    const controller = new JobController(databaseService, evaluationService, s3Service);
    return await controller.get_job_posting(req, res);
  })
);

router.put(
  "/jobs/:job_id",
  asyncHandler(async (req: Request, res: Response) => {
    const databaseService = get_database_service(req);
    const evaluationService = get_evaluation_service(req);
    const s3Service = get_s3_service(req);
    const controller = new JobController(databaseService, evaluationService, s3Service);
    return await controller.update_job_posting(req, res);
  })
);

router.delete(
  "/jobs/:job_id",
  asyncHandler(async (req: Request, res: Response) => {
    const databaseService = get_database_service(req);
    const evaluationService = get_evaluation_service(req);
    const s3Service = get_s3_service(req);
    const controller = new JobController(databaseService, evaluationService, s3Service);
    return await controller.delete_job_posting(req, res);
  })
);

router.post(
  "/jobs/:job_id/apply",
  upload.single("cv_file"),
  asyncHandler(async (req: Request, res: Response) => {
    const databaseService = get_database_service(req);
    const evaluationService = get_evaluation_service(req);
    const s3Service = get_s3_service(req);
    const controller = new JobController(databaseService, evaluationService, s3Service);
    return await controller.apply_for_job(req, res);
  })
);

export default router;

