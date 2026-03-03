import { IsMongoId, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckInDto {
  @ApiProperty({
    description: 'Employee ID for check-in/check-out',
    example: '64f1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsMongoId()
  employeeId: string;

  @ApiPropertyOptional({
    description: 'Check-in time (ISO format)',
    example: '2024-02-01T09:00:00Z',
  })
  @IsOptional()
  @IsString()
  checkInTime?: string;
}
