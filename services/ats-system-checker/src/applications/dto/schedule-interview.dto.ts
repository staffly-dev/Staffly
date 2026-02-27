import { IsString, IsMongoId, IsOptional, MinLength } from 'class-validator';

export class ScheduleInterviewDto {
  @IsString()
  @MinLength(1)
  app_id: string;

  @IsString()
  @IsMongoId()
  user_id: string;

  @IsString()
  interview_date: string;

  @IsString()
  interview_time: string;

  @IsOptional()
  @IsString()
  interview_type?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
