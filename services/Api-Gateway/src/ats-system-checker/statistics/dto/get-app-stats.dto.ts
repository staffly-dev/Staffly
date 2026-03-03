import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAppStatsDto {
  @ApiPropertyOptional({
    description: 'User ID to get application statistics for',
    example: '64f1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsString()
  @IsOptional()
  user_id?: string;
}
