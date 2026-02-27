import {
  Controller,
  NotFoundException,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PayrollService } from './payroll.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee } from '../employees/schemas/employee.schema';

type PayrollCreatePayload = {
  dto: CreatePayrollDto;
  user_id: string;
};

type UserIdPayload = {
  user_id: string;
};

type PayrollSearchPayload = {
  user_id: string;
  firstName?: string;
  lastName?: string;
};

type PayrollUpdatePayload = {
  id: string;
  dto: UpdatePayrollDto;
  user_id: string;
};

type PayrollRemovePayload = {
  id: string;
  user_id: string;
};

@Controller()
export class PayrollController {
  constructor(
    private readonly payrollService: PayrollService,
    @InjectModel(Employee.name) private employeeModel: Model<any>,
  ) { }

  @MessagePattern('hrms.payroll.create')
  async create(@Payload() payload: PayrollCreatePayload) {
    const dto = payload?.dto;
    const userId = payload?.user_id;
    const employee = await this.employeeModel
      .findOne({ _id: dto.employeeId, createdBy: userId })
      .exec();
    if (!employee) throw new NotFoundException('Employee not found or access denied');

    const payroll = await this.payrollService.create(
      dto.employeeId,
      dto.ctc,
      dto.salaryByMonth,
      dto.deduction!,
      userId,
    );
    return { message: 'Payroll created successfully', payroll };
  }

  @MessagePattern('hrms.payroll.findAll')
  async findAll(@Payload() payload: UserIdPayload) {
    const payroll = await this.payrollService.findAll(payload.user_id);
    return { message: 'Payroll fetched successfully', payroll };
  }

  @MessagePattern('hrms.payroll.search')
  async search(@Payload() payload: PayrollSearchPayload) {
    const payroll = await this.payrollService.search(
      payload.user_id,
      payload.firstName,
      payload.lastName,
    );
    return { message: 'Payroll fetched successfully', payroll };
  }

  @MessagePattern('hrms.payroll.update')
  async update(@Payload() payload: PayrollUpdatePayload) {
    const payroll = await this.payrollService.update(payload.id, payload.user_id, payload.dto);
    return { message: 'Payroll updated successfully', payroll };
  }

  @MessagePattern('hrms.payroll.remove')
  async remove(@Payload() payload: PayrollRemovePayload) {
    await this.payrollService.remove(payload.id, payload.user_id);
    return { message: 'Payroll deleted successfully' };
  }
}
