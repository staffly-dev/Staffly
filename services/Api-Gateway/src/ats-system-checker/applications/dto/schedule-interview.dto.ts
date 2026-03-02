import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ScheduleInterviewDto {
  @IsString()
  @IsNotEmpty()
  app_id: string;

  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  interview_date: string;

  @IsString()
  @IsNotEmpty()
  interview_time: string;

  @IsString()
  @IsOptional()
  interview_type?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
