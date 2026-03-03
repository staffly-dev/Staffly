import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateBillingDto {
  @ApiPropertyOptional({
    description: 'Subscription plan',
    example: 'premium',
  })
  @IsOptional()
  @IsString()
  plan?: string;

  @ApiPropertyOptional({
    description: 'Credit card number (last 4 digits)',
    example: '****-****-****-1234',
  })
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @ApiPropertyOptional({
    description: 'Name on card',
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  nameOfCard?: string;

  @ApiPropertyOptional({
    description: 'Card expiry date',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsString()
  expiryDate?: string;

  @ApiPropertyOptional({
    description: 'Card CVV security code',
    example: '***',
  })
  @IsOptional()
  @IsString()
  cvv?: string;

  @ApiPropertyOptional({
    description: 'Billing email address',
    example: 'billing@example.com',
  })
  @IsOptional()
  @IsEmail()
  billingEmail?: string;

  @ApiPropertyOptional({
    description: 'Card billing address',
    example: '123 Main St, City, State 12345',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  cardAddress?: string;

  @ApiPropertyOptional({
    description: 'City',
    example: 'New York',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({
    description: 'Country',
    example: 'USA',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    description: 'ZIP/Postal code',
    example: '10001',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string;
}
