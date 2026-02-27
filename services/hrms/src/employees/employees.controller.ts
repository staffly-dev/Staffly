import {
  Controller,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

type EmployeeIdPayload = {
  id: string;
  user_id: string;
};

type EmployeeCreatePayload = {
  dto: CreateEmployeeDto;
  user_id: string;
};

type EmployeeUpdatePayload = {
  id: string;
  dto: UpdateEmployeeDto;
  user_id: string;
};

type UserIdPayload = {
  user_id: string;
};

@Controller()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) { }

  @MessagePattern('hrms.employees.create')
  async create(@Payload() payload: EmployeeCreatePayload) {
    const employee = await this.employeesService.create(payload.dto, payload.user_id);
    return { message: 'Employee created successfully', employee };
  }

  @MessagePattern('hrms.employees.findAll')
  async findAll(@Payload() payload: UserIdPayload) {
    const employees = await this.employeesService.findAll(payload.user_id);
    return { message: 'Employees fetched successfully', employees };
  }

  @MessagePattern('hrms.employees.findOne')
  async findOne(@Payload() payload: EmployeeIdPayload) {
    const employee = await this.employeesService.findOne(payload.id, payload.user_id);
    return { message: 'Employee fetched successfully', employee };
  }

  @MessagePattern('hrms.employees.update')
  async update(@Payload() payload: EmployeeUpdatePayload) {
    const employee = await this.employeesService.update(payload.id, payload.dto, payload.user_id);
    return { message: 'Employee updated successfully', employee };
  }

  @MessagePattern('hrms.employees.remove')
  async remove(@Payload() payload: EmployeeIdPayload) {
    await this.employeesService.remove(payload.id, payload.user_id);
    return { message: 'Employee deleted successfully' };
  }
}
