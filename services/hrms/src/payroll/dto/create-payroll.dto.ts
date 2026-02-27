import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreatePayrollDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  ctc: string;

  @IsString()
  @IsNotEmpty()
  salaryByMonth: string;

  @IsOptional()
  @IsString()
  deduction?: string;
}
