import { Router, Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { get_database_service } from "../utils/dependencies";
import { ApplicationController } from "../controllers/application.controller";
import { jwt_utils } from "../utils/jwt_utils";
import { verify_user_exists_and_token_valid } from "../utils/gateway_client";

const router = Router();

router.post(
  "/applications",
  asyncHandler(async (req: Request, res: Response) => {
    const authorization = req.headers.authorization;
    const x_user_id = req.headers["x-user-id"] as string;

    // Extract token
    let token_candidate: string | undefined;
    if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
      token_candidate = authorization.split(" ", 2)[1];
    } else if (req.body?.access_token) {
      token_candidate = req.body.access_token;
    }

    if (!token_candidate) {
      return res.status(401).json({
        success: false,
        error: true,
        message: "Missing access token"
      });
    }

    // Normalize token
    token_candidate = token_candidate.trim().replace(/^["']|["']$/g, "");
    if (token_candidate.toLowerCase().startsWith("bearer ")) {
      token_candidate = token_candidate.split(" ", 2)[1].trim();
    }

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

      try {
        await verify_user_exists_and_token_valid(effective_user_id, token_candidate);
      } catch (error: any) {
        return res.status(401).json({
          success: false,
          error: true,
          message: error.message || "User verification failed"
        });
      }
    }

    const databaseService = get_database_service(req);
    const controller = new ApplicationController(databaseService);
    return await controller.get_all_applications(req, res);
  })
);

router.get(
  "/applications/:app_id",
  asyncHandler(async (req: Request, res: Response) => {
    const databaseService = get_database_service(req);
    const controller = new ApplicationController(databaseService);
    return await controller.get_application_by_id(req, res);
  })
);

export default router;

