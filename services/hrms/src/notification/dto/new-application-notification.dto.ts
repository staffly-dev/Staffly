import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class NewApplicationNotificationDto {
  @IsEmail()
  @IsNotEmpty()
  toEmail: string;

  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @IsString()
  @IsNotEmpty()
  candidateName: string;

  @IsString()
  @IsNotEmpty()
  candidateEmail: string;

  @IsString()
  @IsNotEmpty()
  applicationId: string;

  @IsString()
  @IsOptional()
  backendUrl?: string;
}
