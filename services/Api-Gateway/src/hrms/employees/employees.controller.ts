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
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmployeesGatewayService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('api/v1/app/employees')
@UseGuards(JwtAuthGuard)
export class EmployeesGatewayController {
  constructor(private readonly employeesService: EmployeesGatewayService) {}

  @Post('user/:userId')
  async create(
    @Param('userId') userId: string,
    @Body() dto: CreateEmployeeDto,
    @Request() req: any,
  ) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only create employees for your own account',
      );
    }
    return firstValueFrom(this.employeesService.create(userId, dto));
  }

  @Get('user/:userId')
  async findAll(@Param('userId') userId: string, @Request() req: any) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only access your own employees',
      );
    }
    return firstValueFrom(this.employeesService.findAll(userId));
  }

  @Get('user/:userId/:id')
  async findOne(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Request() req: any,
  ) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only access your own employees',
      );
    }
    return firstValueFrom(this.employeesService.findOne(userId, id));
  }

  @Put('user/:userId/:id')
  async update(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @Request() req: any,
  ) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only update your own employees',
      );
    }
    return firstValueFrom(this.employeesService.update(userId, id, dto));
  }

  @Delete('user/:userId/:id')
  async remove(
    @Param('userId') userId: string,
    @Param('id') id: string,
    @Request() req: any,
  ) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only delete your own employees',
      );
    }
    return firstValueFrom(this.employeesService.remove(userId, id));
  }
}
