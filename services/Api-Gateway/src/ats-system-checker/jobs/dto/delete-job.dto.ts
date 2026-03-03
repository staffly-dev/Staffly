import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DeleteJobDto {
  @ApiPropertyOptional({
    description: 'User ID of the job owner',
    example: '64f1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsString()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({
    description: 'Job ID to delete',
    example: 'job_67890',
  })
  @IsString()
  @IsOptional()
  job_id?: string;
}
