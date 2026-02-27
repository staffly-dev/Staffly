/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PayrollGatewayService } from './payroll.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';

@Controller('api/v1/app/payroll')
@UseGuards(JwtAuthGuard)
export class PayrollGatewayController {
  constructor(private readonly payrollService: PayrollGatewayService) {}

  @Post('user/:userId')
  async create(
    @Param('userId') userId: string,
    @Body() dto: CreatePayrollDto,
    @Request() req: any,
  ) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only create payroll for your own employees',
      );
    }
    return firstValueFrom(this.payrollService.create(userId, dto));
  }

  @Get('user/:userId')
  async findAll(@Param('userId') userId: string, @Request() req: any) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only access your own payroll records',
      );
    }
    return firstValueFrom(this.payrollService.findAll(userId));
  }

  @Get('user/:userId/search')
  async search(
    @Param('userId') userId: string,
    @Query('firstName') firstName: string | undefined,
    @Query('lastName') lastName: string | undefined,
    @Request() req: any,
  ) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only search your own payroll records',
      );
    }
    return firstValueFrom(
      this.payrollService.search(userId, firstName, lastName),
    );
  }

  @Put('user/:userId/:id')
  async update(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePayrollDto,
    @Request() req: any,
  ) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only update your own payroll records',
      );
    }
    return firstValueFrom(this.payrollService.update(userId, id, dto));
  }

  @Delete('user/:userId/:id')
  async remove(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Request() req: any,
  ) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only delete your own payroll records',
      );
    }
    return firstValueFrom(this.payrollService.remove(userId, id));
  }
}
