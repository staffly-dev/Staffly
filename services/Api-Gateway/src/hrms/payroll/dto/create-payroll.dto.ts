import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePayrollDto {
  @IsMongoId()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsNotEmpty()
  ctc: string;

  @IsString()
  @IsNotEmpty()
  salaryByMonth: string;

  @IsString()
  @IsOptional()
  deduction?: string;
}
