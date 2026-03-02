import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InterviewScheduledNotificationDto {
  @IsEmail()
  @IsNotEmpty()
  toEmail: string;

  @IsString()
  @IsNotEmpty()
  candidateName: string;

  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @IsString()
  @IsNotEmpty()
  interviewDate: string;

  @IsString()
  @IsNotEmpty()
  interviewTime: string;

  @IsString()
  @IsNotEmpty()
  interviewType: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
