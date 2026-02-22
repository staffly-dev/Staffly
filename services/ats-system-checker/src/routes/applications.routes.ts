import { Router, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { get_database_service } from "../utils/dependencies";
import { ApplicationController } from "../controllers/application.controller";

const router = Router();

router.get(
  "/applications",
  asyncHandler(async (req: Request, res: Response) => {
    const x_user_id = req.headers["x-user-id"] as string;
    const effective_user_id = (req.query.user_id as string) || x_user_id;
    if (effective_user_id && (effective_user_id.length !== 24 || !/^[0-9a-f]{24}$/i.test(effective_user_id))) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "Invalid user_id format (X-User-Id header or query user_id)"
      });
    }
    const databaseService = get_database_service(req);
    const controller = new ApplicationController(databaseService);
    return await controller.get_all_applications(req, res);
  })
);

router.get(
  "/applications/:app_id",
  asyncHandler(async (req: Request, res: Response) => {
    const x_user_id = req.headers["x-user-id"] as string;
    const user_id_from_body = req.body?.user_id as string;
    const effective_user_id = user_id_from_body || x_user_id;
    const app_id = Array.isArray(req.params.app_id) ? req.params.app_id[0] : req.params.app_id;

    // If user_id is provided, verify ownership
    if (effective_user_id) {
      // Validate user_id format
      if (effective_user_id.length !== 24 || !/^[0-9a-f]{24}$/i.test(effective_user_id)) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Invalid user_id format"
        });
      }

      // Verify user owns the application (through job ownership)
      const databaseService = get_database_service(req);
      const application = await databaseService.get_application_by_id(app_id);
      if (!application) {
        return res.status(404).json({
          success: false,
          error: true,
          message: "Application not found"
        });
      }

      // Check if user owns the job that this application belongs to
      const job = await databaseService.get_job_posting_by_id(application.job_id);
      if (!job || job.owner_user_id !== effective_user_id) {
        return res.status(403).json({
          success: false,
          error: true,
          message: "You can only view applications for your own job postings"
        });
      }
    }

    const databaseService = get_database_service(req);
    const controller = new ApplicationController(databaseService);
    return await controller.get_application_by_id(req, res);
  })
);

router.put(
  "/applications/:app_id",
  asyncHandler(async (req: Request, res: Response) => {
    const x_user_id = req.headers["x-user-id"] as string;
    const user_id_from_body = req.body?.user_id as string;
    const effective_user_id = user_id_from_body || x_user_id;
    const app_id = Array.isArray(req.params.app_id) ? req.params.app_id[0] : req.params.app_id;

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

    // Verify user owns the application (through job ownership)
    const databaseService = get_database_service(req);
    const application = await databaseService.get_application_by_id(app_id);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Application not found"
      });
    }

    // Check if user owns the job that this application belongs to
    const job = await databaseService.get_job_posting_by_id(application.job_id);
    if (!job || job.owner_user_id !== effective_user_id) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "You can only update applications for your own job postings"
      });
    }

    const controller = new ApplicationController(databaseService);
    return await controller.update_application(req, res);
  })
);

router.post(
  "/applications/:app_id",
  asyncHandler(async (req: Request, res: Response) => {
    // POST on /applications/:app_id is treated as update (for compatibility)
    const x_user_id = req.headers["x-user-id"] as string;
    const user_id_from_body = req.body?.user_id as string;
    const effective_user_id = user_id_from_body || x_user_id;
    const app_id = Array.isArray(req.params.app_id) ? req.params.app_id[0] : req.params.app_id;

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

    // Verify user owns the application (through job ownership)
    const databaseService = get_database_service(req);
    const application = await databaseService.get_application_by_id(app_id);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Application not found"
      });
    }

    // Check if user owns the job that this application belongs to
    const job = await databaseService.get_job_posting_by_id(application.job_id);
    if (!job || job.owner_user_id !== effective_user_id) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "You can only update applications for your own job postings"
      });
    }

    const controller = new ApplicationController(databaseService);
    return await controller.update_application(req, res);
  })
);

router.post(
  "/applications/:app_id/schedule-interview",
  asyncHandler(async (req: Request, res: Response) => {
    const x_user_id = req.headers["x-user-id"] as string;
    if (!x_user_id || x_user_id.length !== 24 || !/^[0-9a-f]{24}$/i.test(x_user_id)) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "X-User-Id header is required (24 character MongoDB ObjectId)"
      });
    }
    const app_id = Array.isArray(req.params.app_id) ? req.params.app_id[0] : req.params.app_id;
    const databaseService = get_database_service(req);
    const application = await databaseService.get_application_by_id(app_id);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Application not found"
      });
    }
    const job = await databaseService.get_job_posting_by_id(application.job_id);
    if (!job || job.owner_user_id !== x_user_id) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "You can only schedule interviews for applications to your job postings"
      });
    }
    const controller = new ApplicationController(databaseService);
    return await controller.schedule_interview(req, res);
  })
);

router.delete(
  "/applications/:app_id",
  asyncHandler(async (req: Request, res: Response) => {
    const x_user_id = req.headers["x-user-id"] as string;
    const user_id_from_body = req.body?.user_id as string;
    const effective_user_id = user_id_from_body || x_user_id;
    const app_id = Array.isArray(req.params.app_id) ? req.params.app_id[0] : req.params.app_id;

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

    // Verify user owns the application (through job ownership)
    const databaseService = get_database_service(req);
    const application = await databaseService.get_application_by_id(app_id);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: true,
        message: "Application not found"
      });
    }

    // Check if user owns the job that this application belongs to
    const job = await databaseService.get_job_posting_by_id(application.job_id);
    if (!job || job.owner_user_id !== effective_user_id) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "You can only delete applications for your own job postings"
      });
    }

    const controller = new ApplicationController(databaseService);
    return await controller.delete_application(req, res);
  })
);

export default router;

