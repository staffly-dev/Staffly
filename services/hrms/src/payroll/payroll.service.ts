import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payroll, PayrollDocument } from './schemas/payroll.schema';
import { Employee } from '../employees/schemas/employee.schema';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class PayrollService {
  constructor(
    @InjectModel(Payroll.name)
    private payrollModel: Model<PayrollDocument>,
    @InjectModel(Employee.name)
    private employeeModel: Model<Employee>,
  ) {}

  async create(
    employeeId: string,
    ctc: string,
    salaryByMonth: string,
    deduction: string,
    userId: string,
  ) {
    const existing = await this.payrollModel.findOne({
      employeeId,
      createdBy: userId,
    });
    if (existing) {
      throw new RpcException({
        statusCode: 400,
        message: `Employee payroll already exists`,
      });
    }

    const payroll = await this.payrollModel.create({
      employeeId,
      ctc,
      salaryByMonth,
      deduction,
      createdBy: userId,
    });
    return payroll.populate('employeeId', 'firstName lastName profilePicture');
  }

  async findAll(userId: string) {
    return this.payrollModel
      .find({ createdBy: userId })
      .populate('employeeId', 'firstName lastName profilePicture')
      .lean()
      .exec();
  }

  async search(userId: string, firstName?: string, lastName?: string) {
    const pipeline: any[] = [
      { $match: { createdBy: new Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'employees',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee',
        },
      },
      { $unwind: '$employee' },
    ];
    const match: any = {};
    if (firstName) match['employee.firstName'] = { $regex: firstName, $options: 'i' };
    if (lastName) match['employee.lastName'] = { $regex: lastName, $options: 'i' };
    if (Object.keys(match).length > 0) pipeline.push({ $match: match });
    pipeline.push(
      { $addFields: { employeeId: '$employee' } },
      { $project: { employee: 0 } },
    );
    return this.payrollModel.aggregate(pipeline);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdatePayrollDto,
  ) {
    if (dto.employeeId) {
      const employee = await this.employeeModel.findOne({
        _id: dto.employeeId,
        createdBy: userId,
      });
      if (!employee) {
        throw new RpcException({
          statusCode: 404,
          message: `Employee not found or access denied`,
        });
      }
    }

    const updateData: any = {};
    if (dto.ctc != null) updateData.ctc = String(dto.ctc);
    if (dto.salaryByMonth != null)
      updateData.salaryByMonth =
        typeof dto.salaryByMonth === 'object'
          ? JSON.stringify(dto.salaryByMonth)
          : String(dto.salaryByMonth);
    if (dto.deduction != null)
      updateData.deduction =
        typeof dto.deduction === 'object'
          ? JSON.stringify(dto.deduction)
          : String(dto.deduction);
    if (dto.employeeId) updateData.employeeId = dto.employeeId;

    const payroll = await this.payrollModel
      .findOneAndUpdate({ _id: id, createdBy: userId }, updateData, {
        new: true,
      })
      .populate('employeeId', 'firstName lastName')
      .exec();
    if (!payroll) {
      throw new RpcException({
        statusCode: 404,
        message: `Payroll not found or access denied`,
      });
    }
    return payroll;
  }

  async remove(id: string, userId: string) {
    const payroll = await this.payrollModel.findOneAndDelete({
      _id: id,
      createdBy: userId,
    });
    if (!payroll) {
      throw new RpcException({
        statusCode: 404,
        message: `Payroll not found or access denied`,
      });
    }
    return payroll;
  }
}
