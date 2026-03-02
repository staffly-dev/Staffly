import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { EmailVerificationNotificationDto } from './dto/email-verification-notification.dto';
import { PasswordResetNotificationDto } from './dto/password-reset-notification.dto';
import { WelcomeNotificationDto } from './dto/welcome-notification.dto';
import { CvResultNotificationDto } from './dto/cv-result-notification.dto';
import { NewApplicationNotificationDto } from './dto/new-application-notification.dto';
import { QuizResultNotificationDto } from './dto/quiz-result-notification.dto';
import { InterviewScheduledNotificationDto } from './dto/interview-scheduled-notification.dto';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // Auth-related email notifications
  @EventPattern('notification.auth.email_verification')
  async handleEmailVerification(
    @Payload() payload: EmailVerificationNotificationDto,
  ) {
    await this.notificationService.sendEmailVerification(payload);
  }

  @EventPattern('notification.auth.welcome')
  async handleWelcomeEmail(@Payload() payload: WelcomeNotificationDto) {
    await this.notificationService.sendWelcomeEmail(payload);
  }

  @EventPattern('notification.auth.password_reset_requested')
  async handlePasswordResetRequested(
    @Payload() payload: PasswordResetNotificationDto,
  ) {
    await this.notificationService.sendPasswordResetCode(payload);
  }

  // ATS Checker email notifications

  @EventPattern('notification.ats.cv_result')
  async handleCvResult(@Payload() payload: CvResultNotificationDto) {
    await this.notificationService.sendCvResultEmail(payload);
  }

  @EventPattern('notification.ats.new_application')
  async handleNewApplication(
    @Payload() payload: NewApplicationNotificationDto,
  ) {
    await this.notificationService.sendNewApplicationNotificationEmail(payload);
  }

  @EventPattern('notification.ats.quiz_result')
  async handleQuizResult(@Payload() payload: QuizResultNotificationDto) {
    await this.notificationService.sendQuizResultEmail(payload);
  }

  @EventPattern('notification.ats.interview_scheduled')
  async handleInterviewScheduled(
    @Payload() payload: InterviewScheduledNotificationDto,
  ) {
    await this.notificationService.sendInterviewScheduledEmail(payload);
  }

  // Generic in-app dashboard notifications
  @EventPattern('notification.dashboard.generic')
  async handleGenericInApp(@Payload() payload: CreateNotificationDto) {
    return this.notificationService.createInAppNotification(payload);
  }
}
