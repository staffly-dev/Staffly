import { IsString, IsMongoId, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsMongoId()
  user_id: string;

  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  required_skills?: string[];

  @IsOptional()
  additional_details?: string;

  @IsOptional()
  hr_email?: string;

  @IsOptional()
  hr_name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  evaluation_threshold?: number;

  @IsOptional()
  @IsBoolean()
  quiz_required?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quiz_pass_threshold?: number;

  [key: string]: unknown;
}
