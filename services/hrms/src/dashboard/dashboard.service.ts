import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee } from '../employees/schemas/employee.schema';
import { Attendance } from '../attendance/schemas/attendance.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Employee.name) private employeeModel: Model<any>,
    @InjectModel(Attendance.name) private attendanceModel: Model<any>,
  ) {}

  async getStats(userId: string) {
    const totalEmployees = await this.employeeModel.countDocuments({
      createdBy: userId,
    });
    const employeeIds = await this.employeeModel
      .find({ createdBy: userId })
      .distinct('_id');
    const totalAttendance = await this.attendanceModel.countDocuments({
      employeeId: { $in: employeeIds },
    });
    const totalApplicant = 0;
    const totalProjects = 0;
    return {
      totalEmployees,
      totalAttendance,
      totelApplicant: totalApplicant,
      totalProgects: totalProjects,
    };
  }

  async getAllAttendanceForDashboard(userId: string) {
    const employeeIds = await this.employeeModel
      .find({ createdBy: userId })
      .distinct('_id');
    return this.attendanceModel
      .find({ employeeId: { $in: employeeIds } })
      .populate({
        path: 'employeeId',
        select: 'firstName lastName designation employeeType',
      })
      .exec();
  }
}
