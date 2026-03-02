import { IsString, IsOptional } from 'class-validator';

export class GetAllJobsDto {
  @IsString()
  @IsOptional()
  user_id?: string;

  @IsString()
  @IsOptional()
  include_inactive?: string;
}
