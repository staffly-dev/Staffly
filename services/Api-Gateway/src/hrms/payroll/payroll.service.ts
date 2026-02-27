import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';

@Injectable()
export class PayrollGatewayService {
  constructor(
    @Inject('NATS_SERVICE')
    private readonly client: ClientProxy,
  ) {}

  create(userId: string, dto: CreatePayrollDto) {
    return this.client.send('hrms.payroll.create', {
      dto,
      user_id: userId,
    });
  }

  findAll(userId: string) {
    return this.client.send('hrms.payroll.findAll', {
      user_id: userId,
    });
  }

  search(userId: string, firstName?: string, lastName?: string) {
    return this.client.send('hrms.payroll.search', {
      user_id: userId,
      firstName,
      lastName,
    });
  }

  update(userId: string, id: string, dto: UpdatePayrollDto) {
    return this.client.send('hrms.payroll.update', {
      id,
      dto,
      user_id: userId,
    });
  }

  remove(userId: string, id: string) {
    return this.client.send('hrms.payroll.remove', {
      id,
      user_id: userId,
    });
  }
}
