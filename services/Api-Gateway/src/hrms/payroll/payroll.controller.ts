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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PayrollGatewayService } from './payroll.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';

@ApiTags('HRMS Payroll')
@Controller('api/v1/hrms/payroll')
@UseGuards(JwtAuthGuard)
export class PayrollGatewayController {
  constructor(private readonly payrollService: PayrollGatewayService) { }

  @Post('user/:userId')
  @ApiOperation({
    summary: 'Create payroll record',
    description:
      'Creates a new payroll entry for an employee (salary, period, deductions, etc.). Authenticated user can only create for their own context (userId).',
  })
  @ApiBody({
    type: CreatePayrollDto,
    examples: {
      example1: {
        summary: 'Example payroll creation',
        value: {
          employeeId: '64f1a2b3c4d5e6f7g8h9i0j1',
          ctc: '$75000',
          salaryByMonth: '$6250',
          deduction: '$500',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Payroll record created.' })
  @ApiResponse({ status: 403, description: 'Forbidden: can only create for own payroll.' })
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
  @ApiOperation({
    summary: 'List payroll records',
    description:
      'Returns all payroll records for the given user (e.g. company or employee). Use for payroll history or reports. User can only access their own records.',
  })
  @ApiResponse({ status: 200, description: 'List of payroll records.' })
  @ApiResponse({ status: 403, description: 'Forbidden: can only access own payroll.' })
  async findAll(@Param('userId') userId: string, @Request() req: any) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only access your own payroll records',
      );
    }
    return firstValueFrom(this.payrollService.findAll(userId));
  }

  @Get('user/:userId/search')
  @ApiOperation({
    summary: 'Search payroll by name',
    description:
      'Searches payroll records by optional firstName and lastName query params. User can only search their own payroll.',
  })
  @ApiResponse({
    status: 200,
    description: 'Filtered payroll records.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden: can only search own payroll.' })
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
  @ApiOperation({
    summary: 'Update payroll record',
    description:
      'Updates an existing payroll record by id. Send only fields to change. User can only update their own payroll.',
  })
  @ApiBody({
    type: UpdatePayrollDto,
    examples: {
      example1: {
        summary: 'Example payroll update',
        value: {
          employeeId: '64f1a2b3c4d5e6f7g8h9i0j1',
          ctc: '$80000',
          salaryByMonth: '$6666.67',
          deduction: '$600',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Payroll record updated.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: can only update own payroll.',
  })
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
  @ApiOperation({
    summary: 'Delete payroll record',
    description:
      'Deletes a payroll record by id. User can only delete their own payroll records.',
  })
  @ApiResponse({ status: 200, description: 'Payroll record deleted.' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: can only delete own payroll.',
  })
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
