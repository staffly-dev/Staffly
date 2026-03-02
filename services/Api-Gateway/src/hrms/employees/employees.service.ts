import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesGatewayService {
  constructor(
    @Inject('NATS_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  create(userId: string, dto: CreateEmployeeDto) {
    return this.client.send('hrms.employees.create', {
      dto,
      user_id: userId,
    });
  }

  findAll(userId: string) {
    return this.client.send('hrms.employees.findAll', {
      user_id: userId,
    });
  }

  getAllEmployeesByUserId(userId: string) {
    return this.client.send('hrms.employees.getAllEmployeesByUserId', {
      user_id: userId,
    });
  }

  findOne(userId: string) {
    return this.client.send('hrms.employees.findOne', {
      user_id: userId,
    });
  }

  update(userId: string, dto: UpdateEmployeeDto) {
    return this.client.send('hrms.employees.update', {
      dto,
      user_id: userId,
    });
  }

  remove(userId: string) {
    return this.client.send('hrms.employees.remove', {
      user_id: userId,
    });
  }
}
