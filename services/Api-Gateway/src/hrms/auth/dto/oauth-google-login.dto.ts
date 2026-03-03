import { IsEmail, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OAuthGoogleLoginDto {
  @ApiProperty({
    description: 'OAuth provider name',
    example: 'google',
  })
  @IsString()
  provider: string;

  @ApiProperty({
    description: 'Display name from OAuth provider',
    example: 'John Doe',
  })
  @IsString()
  displayName: string;

  @ApiProperty({
    description: 'OAuth provider identifier',
    example: '1234567890',
  })
  @IsString()
  providerId: string;

  @ApiPropertyOptional({
    description: 'Profile picture URL',
    example: 'https://lh3.googleusercontent.com/a-/AOh14yghJ9zT6s8YdK9Qc9IFJrQ=s96-c',
  })
  @IsString()
  @IsOptional()
  picture?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@gmail.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'User agent string',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })
  @IsString()
  @IsOptional()
  userAgent?: string;
}
