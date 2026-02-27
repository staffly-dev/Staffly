import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class UpdatePayrollDto {
  @IsMongoId()
  @IsOptional()
  employeeId?: string;

  @IsString()
  @IsOptional()
  ctc?: string;

  @IsString()
  @IsOptional()
  salaryByMonth?: string;

  @IsString()
  @IsOptional()
  deduction?: string;
}
