/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Body,
  Put,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AccountGatewayService } from './account.service';
import { UpdateAccountDto } from './dto/update-account.dto';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('HRMS Account')
@Controller('api/v1/hrms/account')
@UseGuards(JwtAuthGuard)
export class AccountGatewayController {
  constructor(private readonly accountService: AccountGatewayService) { }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get account by user ID',
    description:
      'Returns the account profile for the given user. Authenticated user can only access their own account (userId must match token). Use to display profile, name, email, preferences, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Account data returned.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: can only access own account.',
  })
  async findOne(@Param('userId') userId: string, @Request() req: any) {
    // Authorization: User can only access their own account
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only access your own account',
      );
    }
    return firstValueFrom(this.accountService.findOne(userId));
  }

  @Put('user/:userId')
  @ApiOperation({
    summary: 'Update account',
    description:
      'Updates the account profile for the given user (e.g. display name, email, phone, avatar URL). Authenticated user can only update their own account. Send only fields to change.',
  })
  @ApiBody({
    type: UpdateAccountDto,
    examples: {
      example1: {
        summary: 'Example account update',
        value: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          avatarUrl: 'https://example.com/avatars/john-doe.jpg',
          bio: 'Software developer with 5 years of experience in web technologies.',
          dateOfBirth: '1990-01-15',
          address: '123 Main St, City, State 12345',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Account updated successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: can only update own account.',
  })
  async update(
    @Param('userId') userId: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @Request() req: any,
  ) {
    // Authorization: User can only update their own account
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only update your own account',
      );
    }
    return firstValueFrom(this.accountService.update(userId, updateAccountDto));
  }
}
