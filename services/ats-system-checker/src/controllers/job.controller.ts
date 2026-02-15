import { Request, Response } from "express";
import { DatabaseService } from "../services/database.service";
import { EvaluationService } from "../services/evaluation.service";
import { S3Service } from "../services/s3.service";
import { JobPostingResponse, JobPostingsListResponse, ApplicationResponse } from "../models/api.models";
import { Env } from "../config/env.config";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export class JobController {
  private database_service: DatabaseService;
  private evaluation_service: EvaluationService;
  private s3_service: S3Service;

  constructor(
    database_service: DatabaseService,
    evaluation_service: EvaluationService,
    s3_service: S3Service
  ) {
    this.database_service = database_service;
    this.evaluation_service = evaluation_service;
    this.s3_service = s3_service;
  }

  async create_job_posting(req: Request, res: Response): Promise<Response> {
    try {
      const {
        title,
        description,
        required_skills,
        additional_details,
        hr_email,
        hr_name,
        owner_user_id,
        owner_username,
        evaluation_threshold = 70,
        quiz_required = true,
        quiz_pass_threshold = 7
      } = req.body;

      console.log(`Creating new job posting: ${title}`);

      if (!title?.trim() || !description?.trim() || !required_skills?.trim()) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "Job title, description, and required skills are required"
        });
      }

      const skills_list = required_skills.split(",").map((s: string) => s.trim()).filter(Boolean);

      const job_posting = await this.database_service.create_job_posting(
        title,
        description,
        skills_list,
        additional_details,
        hr_email,
        hr_name,
        evaluation_threshold,
        quiz_required,
        quiz_pass_threshold,
        owner_user_id,
        owner_username
      );

      const base_url = Env.BACKEND_URL;
      const shareable_link = `${base_url}/apply/${job_posting.job_id}`;

      console.log(`Created job posting with ID: ${job_posting.job_id}`);

      const response: JobPostingResponse = {
        job_id: job_posting.job_id,
        title: job_posting.title,
        description: job_posting.description,
        required_skills: job_posting.required_skills,
        shareable_link,
        created_at: job_posting.created_at,
        is_active: job_posting.is_active,
        hr_email: job_posting.hr_email,
        hr_name: job_posting.hr_name,
        created_by: job_posting.owner_user_id,
        owner_username: job_posting.owner_username
      };

      return res.status(201).json(response);
    } catch (error: any) {
      console.error(`Error creating job posting: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: true,
        message: `Failed to create job posting: ${error.message}`
      });
    }
  }

  async get_job_posting(req: Request, res: Response): Promise<Response> {
    try {
      const job_id = req.params.job_id;
      console.log(`Retrieving job posting: ${job_id}`);

      const job_posting = await this.database_service.get_job_posting_by_id(job_id);
      if (!job_posting) {
        return res.status(404).json({
          success: false,
          error: true,
          message: "Job posting not found"
        });
      }

      const base_url = Env.BACKEND_URL;
      const shareable_link = `${base_url}/apply/${job_posting.job_id}`;

      const response: JobPostingResponse = {
        job_id: job_posting.job_id,
        title: job_posting.title,
        description: job_posting.description,
        required_skills: job_posting.required_skills,
        shareable_link,
        created_at: job_posting.created_at,
        is_active: job_posting.is_active,
        hr_email: job_posting.hr_email,
        hr_name: job_posting.hr_name,
        created_by: job_posting.owner_user_id,
        owner_username: job_posting.owner_username
      };

      return res.status(200).json(response);
    } catch (error: any) {
      console.error(`Error getting job posting: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: true,
        message: `Failed to get job posting: ${error.message}`
      });
    }
  }

  async get_all_job_postings(req: Request, res: Response): Promise<Response> {
    try {
      console.log("Retrieving all job postings");

      const job_postings = await this.database_service.get_all_job_postings();
      const base_url = Env.BACKEND_URL;

      const job_responses: JobPostingResponse[] = job_postings.map(job => ({
        job_id: job.job_id,
        title: job.title,
        description: job.description,
        required_skills: job.required_skills,
        shareable_link: `${base_url}/apply/${job.job_id}`,
        created_at: job.created_at,
        is_active: job.is_active,
        hr_email: job.hr_email,
        hr_name: job.hr_name,
        created_by: job.owner_user_id,
        owner_username: job.owner_username
      }));

      const response: JobPostingsListResponse = {
        total_jobs: job_responses.length,
        jobs: job_responses
      };

      return res.status(200).json(response);
    } catch (error: any) {
      console.error(`Error getting job postings: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: true,
        message: `Failed to get job postings: ${error.message}`
      });
    }
  }

  async update_job_posting(req: Request, res: Response): Promise<Response> {
    try {
      const job_id = req.params.job_id;
      const updates = req.body;

      console.log(`Updating job posting: ${job_id}`);

      const job_posting = await this.database_service.update_job_posting(job_id, updates);
      if (!job_posting) {
        return res.status(404).json({
          success: false,
          error: true,
          message: "Job posting not found"
        });
      }

      const base_url = Env.BACKEND_URL;
      const shareable_link = `${base_url}/apply/${job_posting.job_id}`;

      const response: JobPostingResponse = {
        job_id: job_posting.job_id,
        title: job_posting.title,
        description: job_posting.description,
        required_skills: job_posting.required_skills,
        shareable_link,
        created_at: job_posting.created_at,
        is_active: job_posting.is_active,
        hr_email: job_posting.hr_email,
        hr_name: job_posting.hr_name,
        created_by: job_posting.owner_user_id,
        owner_username: job_posting.owner_username
      };

      return res.status(200).json(response);
    } catch (error: any) {
      console.error(`Error updating job posting: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: true,
        message: `Failed to update job posting: ${error.message}`
      });
    }
  }

  async delete_job_posting(req: Request, res: Response): Promise<Response> {
    try {
      const job_id = req.params.job_id;
      console.log(`Deleting job posting: ${job_id}`);

      const success = await this.database_service.delete_job_posting(job_id);
      if (!success) {
        return res.status(404).json({
          success: false,
          error: true,
          message: "Job posting not found"
        });
      }

      return res.status(200).json({
        success: true,
        message: "Job posting deleted successfully"
      });
    } catch (error: any) {
      console.error(`Error deleting job posting: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: true,
        message: `Failed to delete job posting: ${error.message}`
      });
    }
  }

  async apply_for_job(req: Request, res: Response): Promise<Response> {
    try {
      const job_id = req.params.job_id;
      const { candidate_email, candidate_name } = req.body;
      const file = req.file;

      console.log(`Processing job application for job: ${job_id}`);

      if (!file) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "CV file is required"
        });
      }

      // Get job posting
      const job_posting = await this.database_service.get_job_posting_by_id(job_id);
      if (!job_posting || !job_posting.is_active) {
        return res.status(404).json({
          success: false,
          error: true,
          message: "Job posting not found or inactive"
        });
      }

      // Upload file to S3
      const upload_result = await this.s3_service.upload_file(file);
      const s3_key = upload_result.s3_key;

      // Create application
      const application_id = uuidv4();
      const application = await this.database_service.create_application(
        application_id,
        job_id,
        s3_key,
        candidate_email,
        candidate_name
      );

      // TODO: Process CV evaluation and send email notifications
      // This would involve calling the evaluation service

      const response: ApplicationResponse = {
        application_id: application.application_id,
        job_id: application.job_id,
        status: application.status,
        quiz_required: job_posting.quiz_required
      };

      return res.status(201).json(response);
    } catch (error: any) {
      console.error(`Error processing job application: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: true,
        message: `Failed to process application: ${error.message}`
      });
    }
  }
}

