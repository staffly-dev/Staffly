import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StatisticsResponseDto {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Response message',
    example: 'Statistics retrieved successfully',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Response data containing statistics',
    example: {
      total_jobs: 150,
      total_applications: 1250,
      total_quiz_attempts: 800,
      active_users: 450,
      jobs_this_month: 25,
      applications_this_month: 180,
      quiz_completions_this_month: 95,
    },
  })
  data?: any;
}
