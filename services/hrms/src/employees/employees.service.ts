/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from './schemas/employee.schema';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
  ) {}

  async create(dto: CreateEmployeeDto, userId: string) {
    const existing = await this.employeeModel.findOne({
      emailAddress: dto.emailAddress,
      createdBy: userId,
    });
    if (existing) {
      throw new RpcException({
        statusCode: 400,
        message: `Employee with this email already exists`,
      });
    }
    const employee = await this.employeeModel.create({
      ...dto,
      dateOfBrith: new Date(dto.dateOfBrith),
      joiningAt: new Date(dto.joiningAt),
      createdBy: userId,
    });
    return employee;
  }

  async findAll(userId: string) {
    return this.employeeModel.find({ createdBy: userId }).exec();
  }

  async findOne(id: string, userId: string) {
    const employee = await this.employeeModel
      .findOne({ _id: id, createdBy: userId })
      .exec();
    if (!employee)
      throw new RpcException({
        statusCode: 404,
        message: `Employee not found or access denied`,
      });
    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto, userId: string) {
    const existing = await this.employeeModel
      .findOne({ _id: id, createdBy: userId })
      .exec();
    if (!existing) {
      throw new RpcException({
        statusCode: 404,
        message: `Employee not found or access denied`,
      });
    }

    const updateData: any = { ...dto };
    if (dto.dateOfBrith) updateData.dateOfBrith = new Date(dto.dateOfBrith);
    if (dto.joiningAt) updateData.joiningAt = new Date(dto.joiningAt);
    delete updateData.createdBy;

    const employee = await this.employeeModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    return employee;
  }

  async remove(id: string, userId: string) {
    const employee = await this.employeeModel.findOneAndDelete({
      _id: id,
      createdBy: userId,
    });
    if (!employee) {
      throw new RpcException({
        statusCode: 404,
        message: `Employee not found or access denied`,
      });
    }
    return employee;
  }
}
