import { IsBoolean, IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingDto {
  @ApiPropertyOptional({
    description: 'UI theme preference',
    example: 'dark',
  })
  @IsOptional()
  @IsString()
  theme?: 'light' | 'dark' | 'system';

  @ApiPropertyOptional({
    description: 'Preferred language',
    example: 'en',
  })
  @IsOptional()
  @IsString()
  language?: string;

  // notifications part
  @ApiPropertyOptional({
    description: 'Notification type preference',
    example: 'mentions',
  })
  @IsOptional()
  @IsString()
  type?: 'all' | 'mentions' | 'none';

  @ApiPropertyOptional({
    description: 'Enable communication emails',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  communication_emails?: boolean;

  @ApiPropertyOptional({
    description: 'Enable marketing emails',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  marketing_emails?: boolean;

  @ApiPropertyOptional({
    description: 'Enable social notification emails',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  social_emails?: boolean;

  @ApiPropertyOptional({
    description: 'Enable security notification emails',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  security_emails?: boolean;

  @ApiPropertyOptional({
    description: 'Enable mobile notifications',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  mobile?: boolean;
}
