import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiBody, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateJobDto {
  @ApiProperty({
    description: 'User ID of the job creator',
    example: '64f1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: 'Job title',
    example: 'Senior Software Engineer',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Job description',
    example: 'We are looking for an experienced software engineer to join our team and help build innovative solutions.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Required skills for the job',
    example: 'JavaScript, TypeScript, Node.js, React, MongoDB',
  })
  @IsString()
  @IsOptional()
  required_skills?: string;

  @ApiPropertyOptional({
    description: 'HR contact email',
    example: 'hr@company.com',
  })
  @IsString()
  @IsOptional()
  hr_email?: string;

  @ApiPropertyOptional({
    description: 'HR contact name',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  hr_name?: string;

  @ApiPropertyOptional({
    description: 'Whether a quiz is required for applicants',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  quiz_required?: boolean;

  @ApiPropertyOptional({
    description: 'Minimum score required to pass the quiz (0-10)',
    example: 8,
  })
  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  quiz_pass_threshold?: number;
}
