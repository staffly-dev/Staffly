import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAllJobsDto {
  @ApiPropertyOptional({
    description: 'User ID to filter jobs by',
    example: '64f1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsString()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({
    description: 'Include inactive jobs in results',
    example: 'false',
  })
  @IsString()
  @IsOptional()
  include_inactive?: string;
}
