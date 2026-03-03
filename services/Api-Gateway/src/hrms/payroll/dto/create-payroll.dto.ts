import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePayrollDto {
  @ApiProperty({
    description: 'Employee ID',
    example: '64f1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsMongoId()
  @IsNotEmpty()
  employeeId: string;

  @ApiProperty({
    description: 'Cost to company (annual salary)',
    example: '$75000',
  })
  @IsString()
  @IsNotEmpty()
  ctc: string;

  @ApiProperty({
    description: 'Monthly salary amount',
    example: '$6250',
  })
  @IsString()
  @IsNotEmpty()
  salaryByMonth: string;

  @ApiPropertyOptional({
    description: 'Monthly deductions',
    example: '$500',
  })
  @IsString()
  @IsOptional()
  deduction?: string;
}
