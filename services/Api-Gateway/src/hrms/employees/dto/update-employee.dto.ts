import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateEmployeeDto {
  @ApiPropertyOptional({
    description: 'Employee first name',
    example: 'John',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Employee last name',
    example: 'Doe',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Employee mobile number',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  mobileNumber?: string;

  @ApiPropertyOptional({
    description: 'Employee email address',
    example: 'john.doe@company.com',
  })
  @IsEmail()
  @IsOptional()
  emailAddress?: string;

  @ApiPropertyOptional({
    description: 'Employee job designation',
    example: 'Senior Software Engineer',
  })
  @IsString()
  @IsOptional()
  designation?: string;

  @ApiPropertyOptional({
    description: 'Employee type',
    example: 'full-time',
  })
  @IsString()
  @IsOptional()
  employeeType?: string;
}
