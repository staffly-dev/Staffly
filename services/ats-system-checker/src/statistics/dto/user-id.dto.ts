import { IsOptional, IsString, IsMongoId } from 'class-validator';

export class UserIdDto {
  @IsOptional()
  @IsString()
  @IsMongoId()
  user_id?: string;
}
