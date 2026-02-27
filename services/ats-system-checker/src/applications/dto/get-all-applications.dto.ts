import { IsOptional, IsString, IsMongoId } from 'class-validator';

export class GetAllApplicationsDto {
  @IsOptional()
  @IsString()
  @IsMongoId()
  user_id?: string;
}
