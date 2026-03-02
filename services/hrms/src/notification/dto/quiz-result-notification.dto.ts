import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class QuizResultNotificationDto {
  @IsEmail()
  @IsNotEmpty()
  toEmail: string;

  @IsString()
  @IsNotEmpty()
  candidateName: string;

  @IsString()
  @IsNotEmpty()
  jobTitle: string;

  @IsNumber()
  @IsNotEmpty()
  score: number;

  @IsNumber()
  @IsNotEmpty()
  totalQuestions: number;

  @IsBoolean()
  @IsNotEmpty()
  passed: boolean;
}
