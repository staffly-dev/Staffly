import { IsString, IsOptional } from 'class-validator';

export class GetUsersDto {
  @IsString()
  @IsOptional()
  user_id?: string;
}
