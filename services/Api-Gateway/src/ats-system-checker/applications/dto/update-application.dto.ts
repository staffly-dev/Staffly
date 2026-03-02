import { IsString, IsOptional } from 'class-validator';

export class UpdateApplicationDto {
  @IsString()
  @IsOptional()
  app_id?: string;

  @IsString()
  @IsOptional()
  user_id?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  decision?: string;
}
