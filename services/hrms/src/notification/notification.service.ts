import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schema/notification.schema';
import { EmailSenderService } from './email-sender.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { EmailVerificationNotificationDto } from './dto/email-verification-notification.dto';
import { PasswordResetNotificationDto } from './dto/password-reset-notification.dto';
import { WelcomeNotificationDto } from './dto/welcome-notification.dto';
import { CvResultNotificationDto } from './dto/cv-result-notification.dto';
import { NewApplicationNotificationDto } from './dto/new-application-notification.dto';
import { QuizResultNotificationDto } from './dto/quiz-result-notification.dto';
import { InterviewScheduledNotificationDto } from './dto/interview-scheduled-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    private readonly emailSender: EmailSenderService,
  ) {}

  // Auth notifications
  async sendEmailVerification(
    payload: EmailVerificationNotificationDto,
  ): Promise<void> {
    const subject = 'Verify your email address';
    const html = `<p>Hello${payload.name ? ` ${payload.name}` : ''},</p>
      <p>Your verification code is: <strong>${payload.code}</strong></p>`;
    await this.emailSender.sendEmail({
      to: payload.email,
      subject,
      html,
    });
  }

  async sendWelcomeEmail(payload: WelcomeNotificationDto): Promise<void> {
    const subject = 'Welcome to Vonova';
    const html = `<p>Welcome${payload.name ? ` ${payload.name}` : ''}!</p>`;
    await this.emailSender.sendEmail({
      to: payload.email,
      subject,
      html,
    });
  }

  async sendPasswordResetCode(
    payload: PasswordResetNotificationDto,
  ): Promise<void> {
    const subject = 'Password reset code';
    const html = `<p>Hello${payload.name ? ` ${payload.name}` : ''},</p>
      <p>Your password reset code is: <strong>${payload.code}</strong></p>`;
    await this.emailSender.sendEmail({
      to: payload.email,
      subject,
      html,
    });
  }

  // ATS Checker email notifications

  async sendCvResultEmail(payload: CvResultNotificationDto): Promise<void> {
    const {
      toEmail,
      candidateName,
      jobTitle,
      decision,
      score,
      quizLink,
      evaluationText,
    } = payload;

    let html = `
      <h2>CV Evaluation Result</h2>
      <p>Dear ${candidateName},</p>
      <p>Thank you for applying for the position of <strong>${jobTitle}</strong>.</p>
      <p>Your CV has been evaluated with a score of <strong>${score}/100</strong>.</p>
      <p>Decision: <strong>${decision}</strong></p>
    `;
    if (evaluationText?.trim()) {
      html += `<h3>Feedback</h3><p>${evaluationText
        .trim()
        .replace(/\n/g, '<br/>')}</p>`;
    }
    if (quizLink) {
      html += `<p>Please complete the quiz: <a href="${quizLink}">Take Quiz</a></p>`;
    }
    html += '<p>Best regards,<br/>Staffly Team</p>';

    await this.emailSender.sendEmail({
      to: toEmail,
      subject: `CV Evaluation Result - ${jobTitle}`,
      html,
    });
  }

  async sendNewApplicationNotificationEmail(
    payload: NewApplicationNotificationDto,
  ): Promise<void> {
    const { toEmail, jobTitle, candidateName, candidateEmail, applicationId } =
      payload;

    const html = `
      <h2>New Job Application</h2>
      <p>A new CV has been submitted for the position <strong>${jobTitle}</strong>.</p>
      <p><strong>Candidate:</strong> ${candidateName || 'N/A'}</p>
      <p><strong>Email:</strong> ${candidateEmail || 'N/A'}</p>
      <p><strong>Application ID:</strong> ${applicationId}</p>
      <p>You can view and manage this application in your dashboard.</p>
      <p>Best regards,<br/>Staffly Team</p>
    `;

    await this.emailSender.sendEmail({
      to: toEmail,
      subject: `New application: ${candidateName} applied for ${jobTitle}`,
      html,
    });
  }

  async sendQuizResultEmail(payload: QuizResultNotificationDto): Promise<void> {
    const { toEmail, candidateName, jobTitle, score, totalQuestions, passed } =
      payload;

    const html = `
      <h2>Quiz Result</h2>
      <p>Dear ${candidateName},</p>
      <p>Thank you for completing the quiz for the position of <strong>${jobTitle}</strong>.</p>
      <p>Your score: <strong>${score}/${totalQuestions}</strong></p>
      <p>Status: <strong>${passed ? 'PASSED' : 'FAILED'}</strong></p>
      <p>Best regards,<br/>Staffly Team</p>
    `;

    await this.emailSender.sendEmail({
      to: toEmail,
      subject: `Quiz Result - ${jobTitle}`,
      html,
    });
  }

  async sendInterviewScheduledEmail(
    payload: InterviewScheduledNotificationDto,
  ): Promise<void> {
    const {
      toEmail,
      candidateName,
      jobTitle,
      interviewDate,
      interviewTime,
      interviewType,
      location,
      notes,
    } = payload;

    let html = `
      <h2>Interview Scheduled</h2>
      <p>Dear ${candidateName || 'Candidate'},</p>
      <p>We would like to invite you for an interview for the position of <strong>${jobTitle}</strong>.</p>
      <p><strong>Date:</strong> ${interviewDate || 'N/A'}</p>
      <p><strong>Time:</strong> ${interviewTime || 'N/A'}</p>
      <p><strong>Interview type:</strong> ${(interviewType || 'Video').replace(
        /-/g,
        ' ',
      )}</p>
    `;
    if (location?.trim()) {
      html += `<p><strong>Location / Platform:</strong> ${location.trim()}</p>`;
    }
    if (notes?.trim()) {
      html += `<p><strong>Notes:</strong><br/>${notes
        .trim()
        .replace(/\n/g, '<br/>')}</p>`;
    }
    html += '<p>Best regards,<br/>Staffly Team</p>';

    await this.emailSender.sendEmail({
      to: toEmail,
      subject: `Interview Scheduled - ${jobTitle}`,
      html,
    });
  }

  // In-app notifications
  async createInAppNotification(
    dto: CreateNotificationDto,
  ): Promise<NotificationDocument> {
    const doc = new this.notificationModel({
      userId: dto.userId ? new Types.ObjectId(dto.userId) : undefined,
      title: dto.title,
      message: dto.message,
      type: dto.type ?? 'system',
      data: dto.data ?? {},
      isRead: dto.isRead ?? false,
    });
    return doc.save();
  }

  async listUserNotifications(userId: string): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(id: string): Promise<void> {
    await this.notificationModel
      .updateOne({ _id: new Types.ObjectId(id) }, { $set: { isRead: true } })
      .exec();
  }
}
