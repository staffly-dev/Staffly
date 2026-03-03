import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEmployeeDto {
  @ApiProperty({
    description: 'Employee first name',
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Employee last name',
    example: 'Doe',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Employee mobile number',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  mobileNumber: string;

  @ApiProperty({
    description: 'Employee email address',
    example: 'john.doe@company.com',
  })
  @IsEmail()
  @IsNotEmpty()
  emailAddress: string;

  @ApiPropertyOptional({
    description: 'Employee job designation',
    example: 'Software Engineer',
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
