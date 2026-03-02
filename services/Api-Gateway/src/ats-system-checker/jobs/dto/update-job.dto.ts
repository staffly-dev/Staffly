import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateJobDto {
  @IsString()
  @IsOptional()
  user_id?: string;

  @IsString()
  @IsOptional()
  job_id?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  required_skills?: string;

  @IsString()
  @IsOptional()
  hr_email?: string;

  @IsString()
  @IsOptional()
  hr_name?: string;

  @IsBoolean()
  @IsOptional()
  quiz_required?: boolean;

  @IsString()
  @IsOptional()
  quiz_pass_threshold?: string;
}
