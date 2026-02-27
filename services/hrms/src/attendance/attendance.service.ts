/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { Employee } from '../employees/schemas/employee.schema';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(Employee.name) private employeeModel: Model<any>,
  ) {}

  async recordCheckIn(employeeId: string, userId: string, checkInTime?: Date) {
    const time = checkInTime || new Date();
    const employee = await this.employeeModel
      .findOne({ _id: employeeId, createdBy: userId })
      .exec();
    if (!employee) {
      throw new RpcException({
        statusCode: 404,
        message: `Employee not found or access denied`,
      });
    }

    const startOfDay = new Date(time);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(time);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await this.attendanceModel.findOne({
      employeeId,
      createdBy: userId,
      date: { $gte: startOfDay, $lt: endOfDay },
    });
    if (existing)
      throw new RpcException({
        statusCode: 400,
        message: `Check-in already recorded for today`,
      });

    const checkInDate = new Date(time);
    const startOnTime = new Date(checkInDate);
    startOnTime.setHours(9, 0, 0, 0);
    const endOnTime = new Date(checkInDate);
    endOnTime.setHours(9, 30, 0, 0);
    const status =
      checkInDate >= startOnTime && checkInDate <= endOnTime
        ? 'On Time'
        : 'Late';

    const attendance = await this.attendanceModel.create({
      employeeId,
      createdBy: userId,
      checkInTime: time,
      date: time,
      status,
    });
    return attendance;
  }

  async findAll(userId: string) {
    return this.attendanceModel
      .find({ createdBy: userId })
      .populate({
        path: 'employeeId',
        select: 'firstName lastName designation employeeType',
      })
      .exec();
  }

  async findOne(id: string, userId: string) {
    const attendance = await this.attendanceModel
      .findOne({ _id: id, createdBy: userId })
      .populate({
        path: 'employeeId',
        select: 'firstName lastName designation employeeType',
      })
      .exec();
    if (!attendance)
      throw new RpcException({
        statusCode: 404,
        message: `Attendance not found or access denied`,
      });
    return attendance;
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
    if (firstName || lastName) {
      const empMatch: any = {};
      if (firstName)
        empMatch['employee.firstName'] = { $regex: firstName, $options: 'i' };
      if (lastName)
        empMatch['employee.lastName'] = { $regex: lastName, $options: 'i' };
      pipeline.push({ $match: empMatch });
    }
    pipeline.push({
      $project: {
        _id: 1,
        checkInTime: 1,
        status: 1,
        date: 1,
        employeeId: {
          _id: '$employee._id',
          firstName: '$employee.firstName',
          lastName: '$employee.lastName',
          designation: '$employee.designation',
          employeeType: '$employee.employeeType',
        },
      },
    });

    return this.attendanceModel.aggregate(pipeline);
  }
}
