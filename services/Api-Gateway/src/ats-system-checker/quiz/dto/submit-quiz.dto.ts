import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitQuizDto {
  @ApiProperty({
    description: 'Unique identifier for the quiz session',
    example: 'quiz_session_12345',
  })
  @IsString()
  @IsNotEmpty()
  session_id: string;

  @ApiProperty({
    description: 'Array of selected answer indices',
    example: [0, 2, 1, 3, 0],
    type: [Number],
  })
  @IsArray()
  @IsNotEmpty()
  answers: number[];

  @ApiPropertyOptional({
    description: 'User ID of the quiz taker',
    example: '64f1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsString()
  @IsOptional()
  user_id?: string;
}
