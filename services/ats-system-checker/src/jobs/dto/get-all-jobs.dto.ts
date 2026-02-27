import { IsOptional, IsString, IsMongoId } from 'class-validator';

export class GetAllJobsDto {
  @IsOptional()
  @IsString()
  @IsMongoId()
  user_id?: string;

  @IsOptional()
  include_inactive?: boolean;
}
