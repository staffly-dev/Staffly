import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OAuthWelcomeDto {
  @ApiPropertyOptional({
    description: 'OAuth provider identifier',
    example: '1234567890',
  })
  @IsString()
  @IsOptional()
  providerId?: string;

  @ApiPropertyOptional({
    description: 'User agent string',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiProperty({
    description: 'User role',
    example: 'EMPLOYEE',
  })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiPropertyOptional({
    description: 'Username',
    example: 'johndoe',
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description: 'How did you hear about us',
    example: 'social_media',
  })
  @IsString()
  @IsOptional()
  knowAboutUs?: string;

  @ApiPropertyOptional({
    description: 'Coupon code used',
    example: 'WELCOME10',
  })
  @IsString()
  @IsOptional()
  couponCode?: string;

  @ApiPropertyOptional({
    description: 'Profile picture URL',
    example: 'https://example.com/profile-pic.jpg',
  })
  @IsString()
  @IsOptional()
  profilePictureUrl?: string;

  @ApiPropertyOptional({
    description: 'Answer to security question',
    example: 'Golden Retriever',
  })
  @IsString()
  @IsOptional()
  answerOne?: string;
}
