import { IsString, IsOptional } from 'class-validator';

export class GetAppStatsDto {
  @IsString()
  @IsOptional()
  user_id?: string;
}
