/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SettingsGatewayService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('HRMS Settings')
@Controller('api/v1/hrms/settings')
@UseGuards(JwtAuthGuard)
export class SettingsGatewayController {
  constructor(private readonly settingsService: SettingsGatewayService) { }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get user settings',
    description:
      'Returns the settings/preferences for the given user (notifications, theme, language, etc.). User can only access their own settings.',
  })
  @ApiResponse({ status: 200, description: 'Settings returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: can only access own settings.' })
  async findOne(@Param('userId') userId: string, @Request() req: any) {
    // Authorization: User can only access their own settings
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only access your own settings',
      );
    }
    return firstValueFrom(this.settingsService.findOne(userId));
  }

  @Patch('user/:userId')
  @ApiOperation({
    summary: 'Update user settings',
    description:
      'Partially updates user settings (PATCH). Send only the keys to change. User can only update their own settings.',
  })
  @ApiBody({
    type: UpdateSettingDto,
    examples: {
      example1: {
        summary: 'Example settings update',
        value: {
          theme: 'dark',
          language: 'en',
          type: 'mentions',
          communication_emails: true,
          marketing_emails: false,
          social_emails: true,
          security_emails: true,
          mobile: true,
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Settings updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden: can only update own settings.' })
  async update(
    @Param('userId') userId: string,
    @Body() updateSettingDto: UpdateSettingDto,
    @Request() req: any,
  ) {
    // Authorization: User can only update their own settings
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only update your own settings',
      );
    }
    return firstValueFrom(
      this.settingsService.update(userId, updateSettingDto),
    );
  }

  @Delete('user/:userId')
  @ApiOperation({
    summary: 'Delete or reset user settings',
    description:
      'Removes or resets the user’s settings to defaults. User can only delete their own settings.',
  })
  @ApiResponse({ status: 200, description: 'Settings removed or reset.' })
  @ApiResponse({ status: 403, description: 'Forbidden: can only delete own settings.' })
  async remove(@Param('userId') userId: string, @Request() req: any) {
    // Authorization: User can only delete their own settings
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only delete your own settings',
      );
    }
    return firstValueFrom(this.settingsService.remove(userId));
  }
}
