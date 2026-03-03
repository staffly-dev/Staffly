import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateJobDto {
  @ApiPropertyOptional({
    description: 'User ID of the job owner',
    example: '64f1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsString()
  @IsOptional()
  user_id?: string;

  @ApiPropertyOptional({
    description: 'Job ID to update',
    example: 'job_67890',
  })
  @IsString()
  @IsOptional()
  job_id?: string;

  @ApiPropertyOptional({
    description: 'Updated job title',
    example: 'Senior Software Engineer',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated job description',
    example: 'We are looking for an experienced software engineer to join our team.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated required skills',
    example: 'JavaScript, TypeScript, Node.js, React, MongoDB',
  })
  @IsString()
  @IsOptional()
  required_skills?: string;

  @ApiPropertyOptional({
    description: 'Updated HR contact email',
    example: 'hr@company.com',
  })
  @IsString()
  @IsOptional()
  hr_email?: string;

  @ApiPropertyOptional({
    description: 'Updated HR contact name',
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
    description: 'Updated minimum score to pass the quiz',
    example: '80',
  })
  @IsString()
  @IsOptional()
  quiz_pass_threshold?: string;
}
