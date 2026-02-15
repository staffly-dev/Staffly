import { Request } from "express";
import { DatabaseService } from "../services/database.service";
import { EmailService } from "../services/email.service";
import { EvaluationService } from "../services/evaluation.service";
import { S3Service } from "../services/s3.service";

// Helper to get services from app.locals
export function get_database_service(req: Request): DatabaseService {
  return (req.app.locals as any).databaseService;
}

export function get_email_service(req: Request): EmailService {
  return (req.app.locals as any).emailService;
}

export function get_evaluation_service(req: Request): EvaluationService {
  return (req.app.locals as any).evaluationService;
}

export function get_s3_service(req: Request): S3Service {
  return (req.app.locals as any).s3Service;
}

