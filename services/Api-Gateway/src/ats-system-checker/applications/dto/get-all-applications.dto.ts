import { IsString, IsOptional } from 'class-validator';

export class GetAllApplicationsDto {
  @IsString()
  @IsOptional()
  user_id?: string;
}
