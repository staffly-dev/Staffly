import { IsString, IsOptional } from 'class-validator';

export class GetQuizStatsDto {
  @IsString()
  @IsOptional()
  user_id?: string;
}
