import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CheckInDto {
  @IsString()
  employeeId: string;

  @IsOptional()
  @IsDateString()
  checkInTime?: string;
}
