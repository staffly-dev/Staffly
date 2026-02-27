import { IsString, IsOptional, IsMongoId, MinLength } from 'class-validator';

export class GetOneApplicationDto {
  @IsString()
  @MinLength(1)
  app_id: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  user_id?: string;
}
