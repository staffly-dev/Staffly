import { Router, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { get_database_service, get_evaluation_service, get_email_service } from "../utils/dependencies";
import { QuizController } from "../controllers/quiz.controller";

const router = Router();

router.post(
  "/quiz/submit",
  asyncHandler(async (req: Request, res: Response) => {
    const { answers, quiz_session_id, email } = req.body;

    if (!answers || !quiz_session_id || !email) {
      return res.status(400).json({
        success: false,
        error: true,
        message: "answers, quiz_session_id, and email are required"
      });
    }

    const databaseService = get_database_service(req);
    const evaluationService = get_evaluation_service(req);
    const emailService = get_email_service(req);
    const controller = new QuizController(databaseService, evaluationService, emailService);
    return await controller.evaluate_quiz(req, res);
  })
);

router.get(
  "/quiz/users",
  asyncHandler(async (req: Request, res: Response) => {
    const x_user_id = req.headers["x-user-id"] as string;
    const user_id_from_body = req.query.user_id as string;
    const effective_user_id = user_id_from_body || x_user_id;

    // Validate user_id if provided
    if (effective_user_id) {
      if (effective_user_id.length !== 24 || !/^[0-9a-f]{24}$/i.test(effective_user_id)) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Invalid user_id format"
        });
      }
    }

    const databaseService = get_database_service(req);
    const evaluationService = get_evaluation_service(req);
    const emailService = get_email_service(req);
    const controller = new QuizController(databaseService, evaluationService, emailService);
    return await controller.get_all_quiz_users(req, res);
  })
);

router.post(
  "/quiz/users",
  asyncHandler(async (req: Request, res: Response) => {
    const x_user_id = req.headers["x-user-id"] as string;

    // Validate user_id if provided
    const effective_user_id = req.body?.user_id || x_user_id;
    if (effective_user_id) {
      if (effective_user_id.length !== 24 || !/^[0-9a-f]{24}$/i.test(effective_user_id)) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Invalid user_id format"
        });
      }
    }

    const databaseService = get_database_service(req);
    const evaluationService = get_evaluation_service(req);
    const emailService = get_email_service(req);
    const controller = new QuizController(databaseService, evaluationService, emailService);
    return await controller.get_all_quiz_users(req, res);
  })
);

router.get(
  "/quiz/:session_id",
  asyncHandler(async (req: Request, res: Response) => {
    const databaseService = get_database_service(req);
    const evaluationService = get_evaluation_service(req);
    const emailService = get_email_service(req);
    const controller = new QuizController(databaseService, evaluationService, emailService);
    return await controller.get_quiz_by_session_id(req, res);
  })
);

export default router;

