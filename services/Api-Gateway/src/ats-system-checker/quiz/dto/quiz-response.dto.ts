import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuizResponseDto {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Response message',
    example: 'Quiz submitted successfully',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Response data containing quiz results',
    example: {
      score: 85,
      total_questions: 5,
      correct_answers: 4,
      session_id: 'quiz_session_12345',
      user_id: '64f1a2b3c4d5e6f7g8h9i0j1',
      completed_at: '2024-02-01T14:30:00Z',
    },
  })
  data?: any;
}
