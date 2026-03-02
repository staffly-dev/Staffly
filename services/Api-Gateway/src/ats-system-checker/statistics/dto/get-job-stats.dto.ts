import { IsString, IsOptional } from 'class-validator';

export class GetJobStatsDto {
  @IsString()
  @IsOptional()
  user_id?: string;
}
