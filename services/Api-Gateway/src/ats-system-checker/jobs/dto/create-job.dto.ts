import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

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
