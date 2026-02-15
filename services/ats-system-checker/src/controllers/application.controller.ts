import { Request, Response } from "express";
import { DatabaseService } from "../services/database.service";
import { ApplicationsListResponse, ApplicationListResponse, SingleApplicationResponse } from "../models/api.models";
import { Env } from "../config/env.config";

export class ApplicationController {
  private database_service: DatabaseService;

  constructor(database_service: DatabaseService) {
    this.database_service = database_service;
  }

  async get_all_applications(req: Request, res: Response): Promise<Response> {
    try {
      console.log("Getting all applications");
      
      const applications = await this.database_service.get_all_applications();
      
      const application_responses: ApplicationListResponse[] = applications.map(app => {
        const cv_filename = this._fix_cv_filename_url(app.cv_filename);
        const s3_key = this._extract_s3_key(app.cv_filename);
        
        return {
          application_id: app.application_id,
          candidate_email: app.candidate_email,
          candidate_name: app.candidate_name,
          cv_score: app.cv_score,
          cv_filename,
          s3_key,
          decision: app.decision || undefined,
          job_id: app.job_id,
          quiz_score: app.quiz_score,
          status: app.status
        };
      });
      
      const response: ApplicationsListResponse = {
        total_applications: application_responses.length,
        applications: application_responses
      };
      
      console.log(`Successfully retrieved ${application_responses.length} applications`);
      return res.status(200).json(response);
    } catch (error: any) {
      console.error(`Failed to get applications: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: true,
        message: `Failed to get applications: ${error.message}`
      });
    }
  }

  async get_application_by_id(req: Request, res: Response): Promise<Response> {
    try {
      const application_id = Array.isArray(req.params.app_id) ? req.params.app_id[0] : req.params.app_id;
      console.log(`Getting application: ${application_id}`);
      
      const application = await this.database_service.get_application_by_id(application_id);
      
      if (!application) {
        return res.status(404).json({
          success: false,
          error: true,
          message: "Application not found"
        });
      }
      
      const cv_filename = this._fix_cv_filename_url(application.cv_filename);
      const s3_key = this._extract_s3_key(application.cv_filename);
      
      const response: SingleApplicationResponse = {
        application_id: application.application_id,
        candidate_email: application.candidate_email || "",
        candidate_name: application.candidate_name || "",
        cv_score: application.cv_score || 0,
        cv_filename,
        s3_key,
        decision: application.decision || "PENDING",
        job_id: application.job_id,
        quiz_score: application.quiz_score,
        status: application.status
      };
      
      return res.status(200).json(response);
    } catch (error: any) {
      console.error(`Failed to get application: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: true,
        message: `Failed to get application: ${error.message}`
      });
    }
  }

  private _extract_s3_key(cv_filename: string): string {
    if (!cv_filename) return "";
    
    if (cv_filename.startsWith("http")) {
      if (cv_filename.includes("/s3/file/")) {
        return cv_filename.split("/s3/file/")[1];
      } else if (cv_filename.includes("/s3/")) {
        return cv_filename.split("/s3/")[1];
      }
      // Extract from S3 URL
      const match = cv_filename.match(/cv_uploads\/[^\/]+$/);
      if (match) return match[0];
    }
    
    // If it's already a key, return as is
    if (cv_filename.includes("cv_uploads/")) {
      return cv_filename;
    }
    
    // Default: assume it's a filename in cv_uploads
    return `cv_uploads/${cv_filename}`;
  }

  private _fix_cv_filename_url(cv_filename: string): string {
    if (!cv_filename) return "";
    
    // If it's already a full URL, return as is
    if (cv_filename.startsWith("http")) {
      return cv_filename;
    }
    
    // If it's an S3 key, construct URL
    const s3_key = this._extract_s3_key(cv_filename);
    const base_url = Env.BACKEND_URL;
    return `${base_url}/ats-checker/s3/file/${s3_key}`;
  }
}

