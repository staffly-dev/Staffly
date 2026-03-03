import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePayrollDto {
  @ApiPropertyOptional({
    description: 'Employee ID',
    example: '64f1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsMongoId()
  @IsOptional()
  employeeId?: string;

  @ApiPropertyOptional({
    description: 'Cost to company (annual salary)',
    example: '$80000',
  })
  @IsString()
  @IsOptional()
  ctc?: string;

  @ApiPropertyOptional({
    description: 'Monthly salary amount',
    example: '$6666.67',
  })
  @IsString()
  @IsOptional()
  salaryByMonth?: string;

  @ApiPropertyOptional({
    description: 'Monthly deductions',
    example: '$600',
  })
  @IsString()
  @IsOptional()
  deduction?: string;
}
