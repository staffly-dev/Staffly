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
      
      const x_user_id = req.headers["x-user-id"] as string;
      const effective_user_id = (req.query?.user_id as string) || req.body?.user_id || x_user_id;
      
      const applications = await this.database_service.get_all_applications(effective_user_id);
      
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

  async update_application(req: Request, res: Response): Promise<Response> {
    try {
      const application_id = Array.isArray(req.params.app_id) ? req.params.app_id[0] : req.params.app_id;
      const updates = req.body;
      
      // Remove user_id and created_by from updates (they're for authentication only)
      delete updates.user_id;
      delete updates.created_by;
      
      console.log(`Updating application: ${application_id}`);
      
      const updated_application = await this.database_service.update_application(application_id, updates);
      if (!updated_application) {
        return res.status(404).json({
          success: false,
          error: true,
          message: "Application not found"
        });
      }
      
      const cv_filename = this._fix_cv_filename_url(updated_application.cv_filename);
      const s3_key = this._extract_s3_key(updated_application.cv_filename);
      
      const response: SingleApplicationResponse = {
        application_id: updated_application.application_id,
        candidate_email: updated_application.candidate_email || "",
        candidate_name: updated_application.candidate_name || "",
        cv_score: updated_application.cv_score || 0,
        cv_filename,
        s3_key,
        decision: updated_application.decision || "PENDING",
        job_id: updated_application.job_id,
        quiz_score: updated_application.quiz_score,
        status: updated_application.status
      };
      
      return res.status(200).json({
        success: true,
        message: "Application updated successfully",
        data: response
      });
    } catch (error: any) {
      console.error(`Failed to update application: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: true,
        message: `Failed to update application: ${error.message}`
      });
    }
  }

  async schedule_interview(req: Request, res: Response): Promise<Response> {
    try {
      const application_id = Array.isArray(req.params.app_id) ? req.params.app_id[0] : req.params.app_id;
      const { interview_date, interview_time, interview_type, location, notes } = req.body || {};

      if (!interview_date || !interview_time) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "interview_date and interview_time are required"
        });
      }

      const updated = await this.database_service.update_application(application_id, {
        interview_date,
        interview_time,
        interview_type: interview_type || "video",
        interview_location: location,
        interview_notes: notes,
        interview_scheduled_at: new Date(),
        status: "INTERVIEW_SCHEDULED"
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: true,
          message: "Application not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Interview scheduled successfully",
        data: {
          application_id: updated.application_id,
          interview_date: updated.interview_date,
          interview_time: updated.interview_time,
          interview_type: updated.interview_type,
          interview_location: updated.interview_location,
          status: updated.status
        }
      });
    } catch (error: any) {
      console.error(`Failed to schedule interview: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: true,
        message: `Failed to schedule interview: ${error.message}`
      });
    }
  }

  async delete_application(req: Request, res: Response): Promise<Response> {
    try {
      const application_id = Array.isArray(req.params.app_id) ? req.params.app_id[0] : req.params.app_id;
      console.log(`Deleting application: ${application_id}`);
      
      // Note: We might want to implement soft delete or hard delete
      // For now, we'll use update to set status to DELETED or similar
      const result = await this.database_service.update_application(application_id, {
        status: "DELETED"
      });
      
      if (!result) {
        return res.status(404).json({
          success: false,
          error: true,
          message: "Application not found"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Application deleted successfully"
      });
    } catch (error: any) {
      console.error(`Failed to delete application: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: true,
        message: `Failed to delete application: ${error.message}`
      });
    }
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

