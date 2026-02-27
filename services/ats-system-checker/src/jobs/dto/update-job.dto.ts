import { IsString, IsOptional, IsMongoId, IsObject, MinLength } from 'class-validator';

export class UpdateJobDto {
  @IsString()
  @MinLength(1)
  job_id: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  user_id?: string;

  @IsObject()
  updates: Record<string, unknown>;
}
