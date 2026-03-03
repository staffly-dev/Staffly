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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { EmployeesGatewayService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@ApiTags('HRMS Employees')
@Controller('api/v1/hrms/employees')
@UseGuards(JwtAuthGuard)
export class EmployeesGatewayController {
  constructor(private readonly employeesService: EmployeesGatewayService) { }

  @Post('user/:userId')
  @ApiOperation({
    summary: 'Create employee',
    description:
      'Creates a new employee record under the given user (e.g. company admin). Body includes name, email, role, department, etc. Authenticated user can only create for their own context.',
  })
  @ApiBody({
    type: CreateEmployeeDto,
    examples: {
      example1: {
        summary: 'Example employee creation',
        value: {
          firstName: 'John',
          lastName: 'Doe',
          mobileNumber: '+1234567890',
          emailAddress: 'john.doe@company.com',
          designation: 'Software Engineer',
          employeeType: 'full-time',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Employee created.' })
  @ApiResponse({ status: 403, description: 'Forbidden: can only create for own account.' })
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
  @ApiOperation({
    summary: 'List employees for user',
    description:
      'Returns the list of employees associated with the given user (e.g. company or branch). Use for employee directory or management tables. User can only access their own employees.',
  })
  @ApiResponse({ status: 200, description: 'List of employees.' })
  @ApiResponse({ status: 403, description: 'Forbidden: can only access own employees.' })
  async findAll(@Param('userId') userId: string, @Request() req: any) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only access your own employees',
      );
    }
    return firstValueFrom(this.employeesService.findAll(userId));
  }

  @Get('user/getAllEmployees/:userId')
  @ApiOperation({
    summary: 'Get all employees by user ID',
    description:
      'Alternative endpoint to fetch all employees for a user. Returns full list for the given userId. Use when the frontend needs all employees in one call. Same authorization as list.',
  })
  @ApiResponse({ status: 200, description: 'List of all employees.' })
  @ApiResponse({ status: 403, description: 'Forbidden: can only access own employees.' })
  async getAllEmployeesByUserId(
    @Param('userId') userId: string,
    @Request() req: any,
  ) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only access your own employees',
      );
    }
    return firstValueFrom(this.employeesService.getAllEmployeesByUserId(userId));
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Get one employee',
    description:
      'Returns a single employee by context (userId). Use when you need one employee’s details. User can only access their own employees.',
  })
  @ApiResponse({ status: 200, description: 'Employee details.' })
  @ApiResponse({ status: 403, description: 'Forbidden: can only access own employees.' })
  async findOne(@Param('userId') userId: string, @Request() req: any) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only access your own employees',
      );
    }
    return firstValueFrom(this.employeesService.findOne(userId));
  }

  @Put('user/:userId')
  @ApiOperation({
    summary: 'Update employee',
    description:
      'Updates an existing employee. Send the employee payload with fields to change. User can only update their own employees.',
  })
  @ApiBody({
    type: UpdateEmployeeDto,
    examples: {
      example1: {
        summary: 'Example employee update',
        value: {
          firstName: 'John',
          lastName: 'Doe',
          mobileNumber: '+1234567890',
          emailAddress: 'john.doe@company.com',
          designation: 'Senior Software Engineer',
          employeeType: 'full-time',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Employee updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden: can only update own employees.' })
  async update(
    @Param('userId') userId: string,
    @Body() dto: UpdateEmployeeDto,
    @Request() req: any,
  ) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only update your own employees',
      );
    }
    return firstValueFrom(this.employeesService.update(userId, dto));
  }

  @Delete('user/:userId')
  @ApiOperation({
    summary: 'Delete employee',
    description:
      'Removes an employee record for the given user. Use with caution; may be soft-delete depending on backend. User can only delete their own employees.',
  })
  @ApiResponse({ status: 200, description: 'Employee removed.' })
  @ApiResponse({ status: 403, description: 'Forbidden: can only delete own employees.' })
  async remove(@Param('userId') userId: string, @Request() req: any) {
    if (req.user._id !== userId) {
      throw new ForbiddenException(
        'Access denied: You can only delete your own employees',
      );
    }
    return firstValueFrom(this.employeesService.remove(userId));
  }
}
