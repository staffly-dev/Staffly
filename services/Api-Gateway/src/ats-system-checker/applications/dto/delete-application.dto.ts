import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DeleteApplicationDto {
  @ApiPropertyOptional({
    description: 'Application ID to delete',
    example: 'app_12345',
  })
  @IsString()
  @IsOptional()
  app_id?: string;

  @ApiPropertyOptional({
    description: 'User ID of the application owner',
    example: '64f1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsString()
  @IsOptional()
  user_id?: string;
}
