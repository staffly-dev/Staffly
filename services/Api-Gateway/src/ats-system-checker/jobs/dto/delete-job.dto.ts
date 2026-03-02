import { IsString, IsOptional } from 'class-validator';

export class DeleteJobDto {
  @IsString()
  @IsOptional()
  user_id?: string;

  @IsString()
  @IsOptional()
  job_id?: string;
}
