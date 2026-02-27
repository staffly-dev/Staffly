import { IsString, IsMongoId, IsOptional } from 'class-validator';

export class UserStatsDto {
  @IsString()
  @IsMongoId()
  user_id: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  created_by?: string;
}
