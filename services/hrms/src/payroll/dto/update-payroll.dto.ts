import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdatePayrollDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  employeeId?: string;

  @IsOptional()
  @IsString()
  ctc?: string;

  @IsOptional()
  @IsString()
  salaryByMonth?: string;

  @IsOptional()
  @IsString()
  deduction?: string;
}
