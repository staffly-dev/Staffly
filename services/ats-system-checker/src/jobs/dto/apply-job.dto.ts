import { IsString, IsEmail, IsOptional, IsObject, MinLength } from 'class-validator';

export class ApplyJobFileDto {
  @IsString()
  @MinLength(1)
  filename: string;

  @IsOptional()
  @IsString()
  mimetype?: string;

  @IsString()
  @MinLength(1)
  data_base64: string;
}

export class ApplyJobDto {
  @IsString()
  @MinLength(1)
  job_id: string;

  @IsEmail()
  candidate_email: string;

  @IsOptional()
  @IsString()
  candidate_name?: string;

  @IsObject()
  file: ApplyJobFileDto;
}
