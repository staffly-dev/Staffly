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
import { BillingGatewayService } from './billing.service';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('HRMS Billing')
@Controller('api/v1/hrms/billing')
@UseGuards(JwtAuthGuard)
export class BillingGatewayController {
  constructor(private readonly billingService: BillingGatewayService) { }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get billing info for user',
    description:
      'Returns billing and subscription information for the account (plan, payment method, invoices, usage). Authenticated user can only access their own billing.',
  })
  @ApiResponse({ status: 200, description: 'Billing data returned.' })
  @ApiResponse({ status: 403, description: 'Forbidden: can only access own billing.' })
  async findOne(@Param('userId') userId: string, @Request() req: any) {
    // Authorization: User can only access their own billing
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only access your own billing information',
      );
    }
    return firstValueFrom(this.billingService.findOne(userId));
  }

  @Put('user/:userId')
  @ApiOperation({
    summary: 'Update billing info',
    description:
      'Updates billing details (e.g. payment method, billing address, plan). Authenticated user can only update their own billing. Send only fields to change.',
  })
  @ApiBody({
    type: UpdateBillingDto,
    examples: {
      example1: {
        summary: 'Example billing update',
        value: {
          plan: 'premium',
          cardNumber: '****-****-****-1234',
          nameOfCard: 'John Doe',
          expiryDate: '2025-12-31',
          cvv: '***',
          billingEmail: 'billing@example.com',
          cardAddress: '123 Main St, City, State 12345',
          city: 'New York',
          country: 'USA',
          zipCode: '10001',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Billing updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: can only update own billing.' })
  async update(
    @Param('userId') userId: string,
    @Body() updateBillingDto: UpdateBillingDto,
    @Request() req: any,
  ) {
    // Authorization: User can only update their own billing
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only update your own billing information',
      );
    }
    return firstValueFrom(this.billingService.update(userId, updateBillingDto));
  }
}
