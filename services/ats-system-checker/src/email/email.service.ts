import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class EmailService {
  private resend: Resend | null = null;
  private backendUrl: string;

  constructor(
    private config: ConfigService,
    private databaseService: DatabaseService,
  ) {
    const apiKey = this.config.get<string>('RESEND_API_KEY') || '';
    if (apiKey?.trim()) this.resend = new Resend(apiKey.trim());
    this.backendUrl = this.config.get<string>('BACKEND_URL') || 'http://localhost:4002';
  }

  async sendEmailAsync(
    toEmail: string,
    subject: string,
    body: string,
    notificationType = 'SYSTEM',
    cvEvaluationId?: string,
    quizResultId?: string,
  ): Promise<boolean> {
    let notification: any = null;
    try {
      notification = await this.databaseService.saveEmailNotification(
        toEmail,
        notificationType,
        subject,
        body,
        cvEvaluationId,
        quizResultId,
      );
      const result = await this.sendSync(toEmail, subject, body);
      await this.databaseService.updateEmailNotificationStatus(
        notification._id.toString(),
        result ? 'SENT' : 'FAILED',
      );
      return result;
    } catch (err: any) {
      if (notification) {
        await this.databaseService.updateEmailNotificationStatus(notification._id.toString(), 'FAILED', err?.message);
      }
      return false;
    }
  }

  private async sendSync(toEmail: string, subject: string, body: string): Promise<boolean> {
    if (!this.resend || !toEmail?.trim()) return false;
    try {
      const from = this.config.get<string>('EMAIL_FROM') || 'noreply@example.com';
      const { data, error } = await this.resend.emails.send({
        from,
        to: toEmail.trim(),
        subject: subject || 'Notification from Staffly',
        html: body || '<p>No content</p>',
      });
      if (error) return false;
      return !!data?.id;
    } catch {
      return false;
    }
  }

  async sendCvResultEmail(
    toEmail: string,
    candidateName: string,
    jobTitle: string,
    decision: string,
    score: number,
    quizLink?: string,
    evaluationText?: string,
  ): Promise<boolean> {
    let body = `
      <h2>CV Evaluation Result</h2>
      <p>Dear ${candidateName},</p>
      <p>Thank you for applying for the position of <strong>${jobTitle}</strong>.</p>
      <p>Your CV has been evaluated with a score of <strong>${score}/100</strong>.</p>
      <p>Decision: <strong>${decision}</strong></p>
    `;
    if (evaluationText?.trim()) body += `<h3>Feedback</h3><p>${evaluationText.trim().replace(/\n/g, '<br/>')}</p>`;
    if (quizLink) body += `<p>Please complete the quiz: <a href="${quizLink}">Take Quiz</a></p>`;
    body += '<p>Best regards,<br/>Staffly Team</p>';
    return this.sendEmailAsync(toEmail, `CV Evaluation Result - ${jobTitle}`, body, 'CV_RESULT');
  }

  async sendNewApplicationNotification(
    toEmail: string,
    jobTitle: string,
    candidateName: string,
    candidateEmail: string,
    applicationId: string,
    backendUrl?: string,
  ): Promise<boolean> {
    const base = backendUrl || this.backendUrl;
    const body = `
      <h2>New Job Application</h2>
      <p>A new CV has been submitted for the position <strong>${jobTitle}</strong>.</p>
      <p><strong>Candidate:</strong> ${candidateName || 'N/A'}</p>
      <p><strong>Email:</strong> ${candidateEmail || 'N/A'}</p>
      <p><strong>Application ID:</strong> ${applicationId}</p>
      <p>You can view and manage this application in your dashboard.</p>
      <p>Best regards,<br/>Staffly Team</p>
    `;
    return this.sendEmailAsync(toEmail, `New application: ${candidateName} applied for ${jobTitle}`, body, 'NEW_APPLICATION');
  }

  async sendQuizResultEmail(
    toEmail: string,
    candidateName: string,
    jobTitle: string,
    score: number,
    totalQuestions: number,
    passed: boolean,
  ): Promise<boolean> {
    const body = `
      <h2>Quiz Result</h2>
      <p>Dear ${candidateName},</p>
      <p>Thank you for completing the quiz for the position of <strong>${jobTitle}</strong>.</p>
      <p>Your score: <strong>${score}/${totalQuestions}</strong></p>
      <p>Status: <strong>${passed ? 'PASSED' : 'FAILED'}</strong></p>
      <p>Best regards,<br/>Staffly Team</p>
    `;
    return this.sendEmailAsync(toEmail, `Quiz Result - ${jobTitle}`, body, 'QUIZ_RESULT');
  }

  async sendInterviewScheduledEmail(
    toEmail: string,
    candidateName: string,
    jobTitle: string,
    interviewDate: string,
    interviewTime: string,
    interviewType: string,
    location?: string,
    notes?: string,
  ): Promise<boolean> {
    let details = `
      <h2>Interview Scheduled</h2>
      <p>Dear ${candidateName || 'Candidate'},</p>
      <p>We would like to invite you for an interview for the position of <strong>${jobTitle}</strong>.</p>
      <p><strong>Date:</strong> ${interviewDate || 'N/A'}</p>
      <p><strong>Time:</strong> ${interviewTime || 'N/A'}</p>
      <p><strong>Interview type:</strong> ${(interviewType || 'Video').replace(/-/g, ' ')}</p>
    `;
    if (location?.trim()) details += `<p><strong>Location / Platform:</strong> ${location.trim()}</p>`;
    if (notes?.trim()) details += `<p><strong>Notes:</strong><br/>${notes.trim().replace(/\n/g, '<br/>')}</p>`;
    details += '<p>Best regards,<br/>Staffly Team</p>';
    return this.sendEmailAsync(toEmail, `Interview Scheduled - ${jobTitle}`, details, 'INTERVIEW_SCHEDULED');
  }
}
