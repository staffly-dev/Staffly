import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScheduleInterviewDto {
  @ApiProperty({
    description: 'Application ID for interview scheduling',
    example: 'app_12345',
  })
  @IsString()
  @IsNotEmpty()
  app_id: string;

  @ApiProperty({
    description: 'User ID scheduling the interview',
    example: '64f1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: 'Interview date (YYYY-MM-DD format)',
    example: '2024-02-15',
  })
  @IsString()
  @IsNotEmpty()
  interview_date: string;

  @ApiProperty({
    description: 'Interview time (HH:MM format)',
    example: '14:30',
  })
  @IsString()
  @IsNotEmpty()
  interview_time: string;

  @ApiPropertyOptional({
    description: 'Type of interview',
    example: 'video_call',
  })
  @IsString()
  @IsOptional()
  interview_type?: string;

  @ApiPropertyOptional({
    description: 'Interview location or meeting link',
    example: 'https://zoom.us/j/123456789',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    description: 'Additional interview notes',
    example: 'Please bring portfolio and ID verification',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
