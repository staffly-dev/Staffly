import { IsString, IsMongoId, IsObject, MinLength } from 'class-validator';

export class UpdateApplicationDto {
  @IsString()
  @MinLength(1)
  app_id: string;

  @IsString()
  @IsMongoId()
  user_id: string;

  @IsObject()
  updates: Record<string, unknown>;
}
