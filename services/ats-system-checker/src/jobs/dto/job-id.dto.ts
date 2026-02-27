import { IsString, IsOptional, IsMongoId, MinLength } from 'class-validator';

export class JobIdDto {
  @IsString()
  @MinLength(1)
  job_id: string;

  @IsOptional()
  @IsString()
  @IsMongoId()
  user_id?: string;
}
