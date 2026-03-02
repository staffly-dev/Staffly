import { IsString, IsOptional } from 'class-validator';

export class GetBySessionDto {
  @IsString()
  @IsOptional()
  user_id?: string;

  @IsString()
  @IsOptional()
  session_id?: string;
}
