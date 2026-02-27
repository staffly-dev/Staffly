import { IsString, IsMongoId, MinLength } from 'class-validator';

export class DeleteApplicationDto {
  @IsString()
  @MinLength(1)
  app_id: string;

  @IsString()
  @IsMongoId()
  user_id: string;
}
