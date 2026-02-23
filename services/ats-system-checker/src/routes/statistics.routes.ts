import { Router, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { get_database_service } from "../utils/dependencies";
import { StatisticsController } from "../controllers/statistics.controller";

const router = Router();

router.get(
  "/statistics",
  asyncHandler(async (req: Request, res: Response) => {
    const databaseService = get_database_service(req);
    const controller = new StatisticsController(databaseService);
    const stats = await controller.get_statistics();
    return res.status(200).json(stats);
  })
);

router.get(
  "/statistics/quiz",
  asyncHandler(async (req: Request, res: Response) => {
    const databaseService = get_database_service(req);
    const controller = new StatisticsController(databaseService);
    const x_user_id = req.headers["x-user-id"] as string;
    if (x_user_id && x_user_id.length === 24 && /^[0-9a-f]{24}$/i.test(x_user_id)) {
      const userStats = await controller.get_user_statistics(x_user_id, x_user_id);
      return res.status(200).json({
        total_quizzes: userStats.total_applications,
        quiz_pass_rate: userStats.quiz_pass_rate,
        total_evaluations: userStats.total_evaluations,
        acceptance_rate: userStats.acceptance_rate,
        average_score: userStats.average_score,
        user_id: x_user_id
      });
    }
    const quizStats = await databaseService.get_quiz_statistics();
    return res.status(200).json(quizStats);
  })
);

router.get(
  "/statistics/jobs",
  asyncHandler(async (req: Request, res: Response) => {
    const databaseService = get_database_service(req);
    const x_user_id = req.headers["x-user-id"] as string;
    if (x_user_id && x_user_id.length === 24 && /^[0-9a-f]{24}$/i.test(x_user_id)) {
      const userJobs = await databaseService.get_all_job_postings(x_user_id, true);
      const jobIds = userJobs.map(j => j.job_id);
      const applications = await databaseService.get_all_applications(x_user_id);
      const total_accepted = applications.filter(a => a.status === "ACCEPTED").length;
      const total_rejected = applications.filter(a => a.status === "REJECTED").length;
      return res.status(200).json({
        total_jobs: userJobs.length,
        total_applications: applications.length,
        total_accepted,
        total_rejected,
        user_id: x_user_id
      });
    }
    const jobStats = await databaseService.get_job_statistics();
    return res.status(200).json(jobStats);
  })
);

router.get(
  "/statistics/applications",
  asyncHandler(async (req: Request, res: Response) => {
    const databaseService = get_database_service(req);
    const x_user_id = req.headers["x-user-id"] as string;
    if (x_user_id && x_user_id.length === 24 && /^[0-9a-f]{24}$/i.test(x_user_id)) {
      const applications = await databaseService.get_all_applications(x_user_id);
      const total_accepted = applications.filter(a => a.status === "ACCEPTED").length;
      const total_rejected = applications.filter(a => a.status === "REJECTED").length;
      return res.status(200).json({
        total_applications: applications.length,
        total_accepted,
        total_rejected,
        user_id: x_user_id
      });
    }
    const jobStats = await databaseService.get_job_statistics();
    return res.status(200).json({
      total_applications: jobStats.total_applications,
      total_accepted: jobStats.total_accepted,
      total_rejected: jobStats.total_rejected
    });
  })
);

router.get(
  "/user-statistics",
  asyncHandler(async (req: Request, res: Response) => {
    const x_user_id = req.headers["x-user-id"] as string;
    const x_created_by = req.headers["x-created-by"] as string;

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

    // Validate created_by
    if (x_created_by && x_created_by !== x_user_id) {
      return res.status(403).json({
        success: false,
        error: true,
        message: "created_by must match user_id"
      });
    }

    const created_by = x_created_by || x_user_id;
    const databaseService = get_database_service(req);
    const controller = new StatisticsController(databaseService);
    const stats = await controller.get_user_statistics(x_user_id, created_by);

    return res.status(200).json({
      user_id: stats.user_id,
      created_by: stats.created_by,
      total_applications: stats.total_applications,
      total_evaluations: stats.total_evaluations,
      acceptance_rate: stats.acceptance_rate,
      average_score: stats.average_score,
      quiz_pass_rate: stats.quiz_pass_rate ?? 0,
      daily_stats: stats.daily_stats ?? {}
    });
  })
);

export default router;

