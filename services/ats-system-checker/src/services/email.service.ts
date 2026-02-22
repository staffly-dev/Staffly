import { Resend } from "resend";
import { Env } from "../config/env.config";
import { DatabaseService } from "./database.service";

export class EmailService {
  private resend: Resend | null = null;
  private database_service: DatabaseService | null = null;
  private backend_url: string;

  constructor(
    resend_api_key: string,
    database_service?: DatabaseService,
    frontend_url?: string
  ) {
    this.backend_url = frontend_url || Env.BACKEND_URL;
    this.database_service = database_service || null;

    if (resend_api_key && resend_api_key.trim()) {
      this.resend = new Resend(resend_api_key.trim());
    }
  }

  async send_email_async(
    to_email: string,
    subject: string,
    body: string,
    notification_type: string = "SYSTEM",
    cv_evaluation_id?: string,
    quiz_result_id?: string
  ): Promise<boolean> {
    let notification = null;

    try {
      // Save notification to database first
      if (this.database_service) {
        notification = await this.database_service.save_email_notification(
          to_email,
          notification_type,
          subject,
          body,
          cv_evaluation_id,
          quiz_result_id
        );
      }

      // Send email
      const result = await this._send_email_sync(to_email, subject, body);

      // Update notification status
      if (notification && this.database_service) {
        const status = result ? "SENT" : "FAILED";
        await this.database_service.update_email_notification_status(
          notification._id.toString(),
          status
        );
      }

      return result;
    } catch (error: any) {
      console.error("Error sending async email:", error);
      if (notification && this.database_service) {
        await this.database_service.update_email_notification_status(
          notification._id.toString(),
          "FAILED",
          error.message
        );
      }
      return false;
    }
  }

  private async _send_email_sync(to_email: string, subject: string, body: string): Promise<boolean> {
    if (!this.resend) {
      console.error("Resend client not configured. Check RESEND_API_KEY environment variable.");
      return false;
    }

    if (!to_email || !to_email.trim()) {
      console.error("Invalid email address:", to_email);
      return false;
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: Env.EMAIL_FROM,
        to: to_email.trim(),
        subject: subject || "Notification from Staffly",
        html: body || "<p>No content</p>"
      });

      if (error) {
        console.error("Resend API error:", error);
        return false;
      }

      console.log(`Email sent successfully to ${to_email}. Message ID: ${data?.id}`);
      return true;
    } catch (error: any) {
      console.error(`Failed to send email to ${to_email}:`, error.message);
      if (error.code) {
        console.error(`Error code: ${error.code}`);
      }
      return false;
    }
  }

  async send_cv_result_email(
    to_email: string,
    candidate_name: string,
    job_title: string,
    decision: string,
    score: number,
    quiz_link?: string,
    evaluation_text?: string
  ): Promise<boolean> {
    const subject = `CV Evaluation Result - ${job_title}`;
    let body = `
      <h2>CV Evaluation Result</h2>
      <p>Dear ${candidate_name},</p>
      <p>Thank you for applying for the position of <strong>${job_title}</strong>.</p>
      <p>Your CV has been evaluated with a score of <strong>${score}/100</strong>.</p>
      <p>Decision: <strong>${decision}</strong></p>
    `;

    if (evaluation_text && evaluation_text.trim()) {
      body += `<h3>Feedback</h3><p>${evaluation_text.trim().replace(/\n/g, "<br/>")}</p>`;
    }

    if (quiz_link) {
      body += `<p>Please complete the quiz: <a href="${quiz_link}">Take Quiz</a></p>`;
    }

    body += `<p>Best regards,<br/>Staffly Team</p>`;

    return await this.send_email_async(to_email, subject, body, "CV_RESULT");
  }

  async send_new_application_notification(
    to_email: string,
    job_title: string,
    candidate_name: string,
    candidate_email: string,
    application_id: string,
    backend_url?: string
  ): Promise<boolean> {
    const base_url = backend_url || this.backend_url;
    const subject = `New application: ${candidate_name} applied for ${job_title}`;
    const body = `
      <h2>New Job Application</h2>
      <p>A new CV has been submitted for the position <strong>${job_title}</strong>.</p>
      <p><strong>Candidate:</strong> ${candidate_name || "N/A"}</p>
      <p><strong>Email:</strong> ${candidate_email || "N/A"}</p>
      <p><strong>Application ID:</strong> ${application_id}</p>
      <p>You can view and manage this application in your dashboard.</p>
      <p>Best regards,<br/>Staffly Team</p>
    `;
    return await this.send_email_async(to_email, subject, body, "NEW_APPLICATION");
  }

  async send_quiz_result_email(
    to_email: string,
    candidate_name: string,
    job_title: string,
    score: number,
    total_questions: number,
    passed: boolean
  ): Promise<boolean> {
    const subject = `Quiz Result - ${job_title}`;
    const body = `
      <h2>Quiz Result</h2>
      <p>Dear ${candidate_name},</p>
      <p>Thank you for completing the quiz for the position of <strong>${job_title}</strong>.</p>
      <p>Your score: <strong>${score}/${total_questions}</strong></p>
      <p>Status: <strong>${passed ? "PASSED" : "FAILED"}</strong></p>
      <p>Best regards,<br/>Staffly Team</p>
    `;

    return await this.send_email_async(to_email, subject, body, "QUIZ_RESULT");
  }
}

