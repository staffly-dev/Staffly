import { IsString, IsOptional } from 'class-validator';

export class GetOneApplicationDto {
  @IsString()
  @IsOptional()
  app_id?: string;

  @IsString()
  @IsOptional()
  user_id?: string;
}
