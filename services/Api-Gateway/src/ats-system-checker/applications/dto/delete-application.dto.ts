import { IsString, IsOptional } from 'class-validator';

export class DeleteApplicationDto {
  @IsString()
  @IsOptional()
  app_id?: string;

  @IsString()
  @IsOptional()
  user_id?: string;
}
