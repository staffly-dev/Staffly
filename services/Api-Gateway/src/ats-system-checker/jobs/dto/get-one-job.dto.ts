import { IsString, IsOptional } from 'class-validator';

export class GetOneJobDto {
  @IsString()
  @IsOptional()
  user_id?: string;

  @IsString()
  @IsOptional()
  job_id?: string;
}
