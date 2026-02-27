import { IsOptional, IsString, IsMongoId } from 'class-validator';

export class QuizUsersDto {
  @IsOptional()
  @IsString()
  @IsMongoId()
  user_id?: string;
}
