import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JobsResponseDto {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Response message',
    example: 'Job created successfully',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Response data containing job details',
    example: {
      jobs: [
        {
          id: 'job_67890',
          user_id: '64f1a2b3c4d5e6f7g8h9i0j1',
          title: 'Senior Software Engineer',
          description:
            'We are looking for an experienced software engineer to join our team.',
          status: 'active',
          created_at: '2024-02-01T10:30:00Z',
        }
      ]
    }
  })
  data?: any;
}
