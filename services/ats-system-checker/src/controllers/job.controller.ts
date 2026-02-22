import { Request, Response } from "express";
import { DatabaseService } from "../services/database.service";
import { EvaluationService } from "../services/evaluation.service";
import { S3Service } from "../services/s3.service";
import { JobPostingResponse, JobPostingsListResponse, ApplicationResponse } from "../models/api.models";
import { EvaluationDecision } from "../models/evaluation.models";
import { Env } from "../config/env.config";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import pdfParse from "pdf-parse";
import fs from "fs";
import path from "path";

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
      const job_id = Array.isArray(req.params.job_id) ? req.params.job_id[0] : req.params.job_id;
      console.log(`Retrieving job posting: ${job_id}`);

      const job_posting = await this.database_service.get_job_posting_by_id(job_id);
      if (!job_posting) {
        return res.status(404).json({
          success: false,
          error: true,
          message: "Job posting not found"
        });
      }

      // Check if job is active - if not, only allow owner to view it
      const x_user_id = req.headers["x-user-id"] as string;
      if (!job_posting.is_active) {
        // If user is not the owner, return 404 (as if job doesn't exist)
        if (!x_user_id || job_posting.owner_user_id !== x_user_id) {
          return res.status(404).json({
            success: false,
            error: true,
            message: "Job posting not found"
          });
        }
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
      
      const x_user_id = req.headers["x-user-id"] as string;
      const include_inactive = req.query.include_inactive === "true";
      
      const job_postings = await this.database_service.get_all_job_postings(x_user_id, include_inactive);
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
      const job_id = Array.isArray(req.params.job_id) ? req.params.job_id[0] : req.params.job_id;
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
      const job_id = Array.isArray(req.params.job_id) ? req.params.job_id[0] : req.params.job_id;
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
      const job_id = Array.isArray(req.params.job_id) ? req.params.job_id[0] : req.params.job_id;
      const { candidate_email, candidate_name } = req.body || {};
      const file = req.file;

      console.log(`Processing job application for job: ${job_id}`);

      if (!file) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "CV file is required (cv_file)"
        });
      }

      if (!candidate_email || !String(candidate_email).trim()) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "candidate_email is required so we can send you the evaluation result"
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
        job_id as string,
        s3_key,
        candidate_email,
        candidate_name
      );

      // Send "new application" email to job owner / HR so they receive the message when CV is uploaded
      const email_service = this.evaluation_service.get_email_service();
      const notify_email = job_posting.hr_email || Env.EMAIL_FROM;
      if (email_service && notify_email) {
        email_service.send_new_application_notification(
          notify_email,
          job_posting.title || "Job Position",
          candidate_name || "Candidate",
          candidate_email || "",
          application.application_id,
          Env.BACKEND_URL
        ).then(sent => {
          if (sent) console.log("New application notification sent");
          else console.warn("Failed to send new application notification");
        }).catch(err => console.error("Error sending new application email:", err.message));
      }

      // Process CV evaluation and send email notifications asynchronously (includes email to candidate with result)
      this._process_cv_evaluation_async(
        file,
        job_posting,
        application,
        candidate_email,
        candidate_name
      ).catch(error => {
        console.error("Error processing CV evaluation:", error);
      });

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

  private async _process_cv_evaluation_async(
    file: Express.Multer.File,
    job_posting: any,
    application: any,
    candidate_email: string,
    candidate_name: string
  ): Promise<void> {
    try {
      const startTime = Date.now();
      
      // Extract text from CV file
      let cv_text = "";
      const file_extension = path.extname(file.originalname).toLowerCase();
      
      if (file_extension === ".pdf") {
        const pdf_buffer = fs.readFileSync(file.path);
        const pdf_data = await pdfParse(pdf_buffer);
        cv_text = pdf_data.text;
      } else if (file_extension === ".docx") {
        try {
          // Dynamic import to avoid loading issues
          const mammoth = await import("mammoth");
          const docx_buffer = fs.readFileSync(file.path);
          const result = await mammoth.default.extractRawText({ buffer: docx_buffer });
          cv_text = result.value;
        } catch (docxError: any) {
          console.error("Error extracting text from DOCX:", docxError.message);
          // If DOCX extraction fails, send email notification
          const email_service = this.evaluation_service.get_email_service();
          if (email_service && candidate_email) {
            try {
              await email_service.send_email_async(
                candidate_email,
                "CV Submission Received",
                `<p>Dear ${candidate_name || "Candidate"},</p>
                <p>Thank you for submitting your CV. We have received your application.</p>
                <p>However, we encountered an issue processing your DOCX file. Please resubmit your CV as a PDF file for automated evaluation.</p>
                <p>Best regards,<br/>Staffly Team</p>`,
                "CV_SUBMISSION"
              );
            } catch (emailError: any) {
              console.error(`Failed to send email:`, emailError.message);
            }
          }
          return;
        }
      } else {
        console.warn(`Unsupported file type: ${file_extension}`);
        return;
      }

      if (!cv_text || cv_text.trim().length === 0) {
        console.warn("No text extracted from CV file");
        const email_service = this.evaluation_service.get_email_service();
        if (email_service && candidate_email) {
          try {
            await email_service.send_email_async(
              candidate_email,
              "CV Received - Manual Review",
              `<p>Dear ${candidate_name || "Candidate"},</p>
              <p>Thank you for submitting your CV for <strong>${job_posting.title || "the position"}</strong>.</p>
              <p>We have received your application and saved your CV. We could not extract text from your file for automated evaluation, so your application will be reviewed manually.</p>
              <p>Best regards,<br/>Staffly Team</p>`,
              "CV_RECEIVED"
            );
          } catch (e: any) {
            console.error("Failed to send CV-received email:", e.message);
          }
        }
        return;
      }

      // Evaluate CV using AI service
      const evaluation_result = await this.evaluation_service.evaluate_cv(
        cv_text,
        job_posting.description || "",
        job_posting.required_skills || []
      );

      const processing_time = Date.now() - startTime;

      // Save evaluation to database
      const evaluation = await this.database_service.save_cv_evaluation(
        file.originalname,
        job_posting.description || "",
        evaluation_result.decision,
        evaluation_result.score,
        evaluation_result.evaluation_text,
        evaluation_result.text_length,
        candidate_email || evaluation_result.email,
        processing_time,
        job_posting.owner_user_id
      );

      // Update application with cv_score and decision so GET /applications/{id} and list views show correct data
      const isAccepted =
        evaluation_result.decision === EvaluationDecision.ACCEPT ||
        evaluation_result.decision === EvaluationDecision.ACCEPTED;
      await this.database_service.update_application(application.application_id, {
        cv_score: evaluation_result.score,
        decision: String(evaluation_result.decision),
        status: isAccepted ? "ACCEPTED" : "REJECTED"
      });

      // Generate quiz link if quiz is required and CV is accepted
      let quiz_link: string | undefined;
      if (job_posting.quiz_required && (evaluation_result.decision === EvaluationDecision.ACCEPT || evaluation_result.decision === EvaluationDecision.ACCEPTED)) {
        // Create quiz session
        const quiz = await this.evaluation_service.generate_quiz(job_posting.description || "");
        const quiz_session = await this.database_service.save_quiz_session(
          job_posting.description || "",
          quiz.questions || [],
          file.originalname,
          candidate_email || "",
          job_posting.quiz_time_limit || 300,
          job_posting.quiz_pass_threshold || 7,
          job_posting.owner_user_id
        );

        quiz_link = `${Env.FRONTEND_URL_QUIZ}/ats-checker/quiz/${quiz_session._id}`;
      }

      // Send email to the applicant with the AI evaluation result (score, decision, reasoning)
      const email_service = this.evaluation_service.get_email_service();
      const applicant_email = candidate_email || evaluation_result.email;
      if (email_service && applicant_email) {
        try {
          await email_service.send_cv_result_email(
            applicant_email,
            candidate_name || "Candidate",
            job_posting.title || "Job Position",
            String(evaluation_result.decision),
            evaluation_result.score,
            quiz_link,
            evaluation_result.evaluation_text
          );
          console.log("CV result email sent to applicant");
        } catch (emailError: any) {
          console.error("Failed to send email to applicant:", emailError.message);
        }
      } else {
        console.warn("Email service not available or candidate email missing");
      }
    } catch (error: any) {
      console.error("Error in CV evaluation process:", error);
      // Optionally send error notification email
    }
  }
}

