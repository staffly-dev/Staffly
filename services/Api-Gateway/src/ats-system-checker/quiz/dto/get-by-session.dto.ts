import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetBySessionDto {
  @ApiPropertyOptional({
    description: 'User ID of the quiz taker',
    example: '64f1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsString()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({
    description: 'Quiz session ID to retrieve',
    example: 'quiz_session_12345',
  })
  @IsString()
  @IsOptional()
  session_id?: string;
}
