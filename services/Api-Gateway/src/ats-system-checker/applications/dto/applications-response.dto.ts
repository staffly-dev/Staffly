import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplicationsResponseDto {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Response message',
    example: 'Application retrieved successfully',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Response data containing application details',
    example: {
      applications: [
        {
          id: 'app_12345',
          user_id: '64f1a2b3c4d5e6f7g8h9i0j1',
          job_id: 'job_67890',
          status: 'under_review',
          created_at: '2024-02-01T10:30:00Z',
        }
      ]
    },
  })
  data?: any;
}
