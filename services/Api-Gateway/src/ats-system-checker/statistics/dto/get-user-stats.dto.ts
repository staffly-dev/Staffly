import { IsString, IsOptional } from 'class-validator';

export class GetUserStatsDto {
  @IsString()
  @IsOptional()
  user_id?: string;

  @IsString()
  @IsOptional()
  created_by?: string;
}
