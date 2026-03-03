import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplyJobDto {
  @ApiProperty({
    description: 'Job ID to apply for',
    example: 'job_67890',
  })
  @IsString()
  @IsNotEmpty()
  job_id: string;

  @ApiProperty({
    description: 'Candidate email address',
    example: 'john.doe@example.com',
  })
  @IsString()
  @IsNotEmpty()
  candidate_email: string;

  @ApiPropertyOptional({
    description: 'Candidate full name',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  candidate_name?: string;
}
