import { IsString, IsMongoId } from 'class-validator';

export class UserIdDto {
  @IsString()
  @IsMongoId()
  user_id: string;
}
