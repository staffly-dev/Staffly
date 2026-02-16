import { Router, Request, Response } from "express";
import multer from "multer";
import { asyncHandler } from "../utils/asyncHandler";
import { get_database_service, get_evaluation_service, get_s3_service } from "../utils/dependencies";
import { JobController } from "../controllers/job.controller";
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
    const x_user_id = req.headers["x-user-id"] as string;
    const include_inactive = req.query.include_inactive === "true";

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
      evaluation_threshold = 70,
      quiz_required = true,
      quiz_pass_threshold = 7
    } = req.body;

    // Get user_id from header or body
    const x_user_id = req.headers["x-user-id"] as string;
    const effective_user_id = user_id || x_user_id;

    // Require user_id
    if (!effective_user_id) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "user_id is required (provide in body or X-User-Id header)"
      });
    }

    // Validate user_id format
    if (effective_user_id.length !== 24 || !/^[0-9a-f]{24}$/i.test(effective_user_id)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid user_id format"
      });
    }

    const databaseService = get_database_service(req);
    const evaluationService = get_evaluation_service(req);
    const s3Service = get_s3_service(req);
    const controller = new JobController(databaseService, evaluationService, s3Service);

    // Set owner_user_id from effective_user_id
    req.body.owner_user_id = effective_user_id;
    if (owner_username) {
      req.body.owner_username = owner_username;
    }

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
    const x_user_id = req.headers["x-user-id"] as string;
    const user_id_from_body = req.body?.user_id as string;
    const effective_user_id = user_id_from_body || x_user_id;
    const job_id = req.params.job_id;

    // Require user id
    if (!effective_user_id) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "user_id is required (provide in body or X-User-Id header)"
      });
    }

    // Validate user_id format
    if (effective_user_id.length !== 24 || !/^[0-9a-f]{24}$/i.test(effective_user_id)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid user_id format"
      });
    }

    // Verify user owns the job
    const databaseService = get_database_service(req);
    const job = await databaseService.get_job_posting_by_id(job_id);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Job posting not found"
      });
    }

    if (job.owner_user_id !== effective_user_id) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "You can only update your own job postings"
      });
    }

    const evaluationService = get_evaluation_service(req);
    const s3Service = get_s3_service(req);
    const controller = new JobController(databaseService, evaluationService, s3Service);
    return await controller.update_job_posting(req, res);
  })
);

router.delete(
  "/jobs/:job_id",
  asyncHandler(async (req: Request, res: Response) => {
    const x_user_id = req.headers["x-user-id"] as string;
    const user_id_from_body = req.body?.user_id as string;
    const effective_user_id = user_id_from_body || x_user_id;
    const job_id = req.params.job_id;

    // Require user id
    if (!effective_user_id) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "user_id is required (provide in body or X-User-Id header)"
      });
    }

    // Validate user_id format
    if (effective_user_id.length !== 24 || !/^[0-9a-f]{24}$/i.test(effective_user_id)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid user_id format"
      });
    }

    // Verify user owns the job
    const databaseService = get_database_service(req);
    const job = await databaseService.get_job_posting_by_id(job_id);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Job posting not found"
      });
    }

    if (job.owner_user_id !== effective_user_id) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "You can only delete your own job postings"
      });
    }

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

