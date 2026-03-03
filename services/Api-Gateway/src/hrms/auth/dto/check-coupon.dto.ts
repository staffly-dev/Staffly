import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckCouponDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Coupon code to validate',
    example: 'SAVE20',
  })
  @IsString()
  @IsNotEmpty()
  couponCode: string;

  @ApiPropertyOptional({
    description: 'User ID for validation',
    example: '64f1a2b3c4d5e6f7g8h9i0j1',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;
}
