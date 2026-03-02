import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class ApplyJobDto {
  @IsString()
  @IsNotEmpty()
  job_id: string;

  @IsString()
  @IsNotEmpty()
  candidate_email: string;

  @IsString()
  @IsOptional()
  candidate_name?: string;
}
