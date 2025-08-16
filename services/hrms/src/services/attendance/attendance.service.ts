import Attendance, { IAttendance } from "../../models/attendance/attendance.model";
import EmployeeModel from "../../models/employees/employee.model";
import { NotFoundException } from "../../utils/app-error";

export const recordCheckInService = async (
  employeeId: string,
  checkInTime?: Date
): Promise<IAttendance> => {

  const finalCheckInTime = checkInTime || new Date();

  const employee = await EmployeeModel.findById(employeeId);
  if (!employee) throw new NotFoundException("Employee not found");

  const attendance = await Attendance.findOne({
    employeeId,
    date: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lt: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  });
  if (attendance) throw new NotFoundException("Check-in already recorded for today");

  // Create 9:00 and 9:30 times for comparison
  const checkInDate = new Date(finalCheckInTime);
  const startOnTime = new Date(checkInDate);
  startOnTime.setHours(9, 0, 0, 0);

  const endOnTime = new Date(checkInDate);
  endOnTime.setHours(9, 30, 0, 0);

  const status = (finalCheckInTime >= startOnTime && finalCheckInTime <= endOnTime) ? "On Time" : "Late";

  const newAttendance = new Attendance({
    employeeId,
    checkInTime: finalCheckInTime,
    status,
  });

  return await newAttendance.save();
};

export const getAllAttendanceService = async (): Promise<IAttendance[]> => {
  return await Attendance.find().populate({
    path: "employeeId",
    model: EmployeeModel,
    select: "firstName lastName designation employeeType"
  });
};

export const getAttendanceService = async (id: string): Promise<IAttendance> => {
  const attendance = await Attendance.findById(id).populate({
    path: "employeeId",
    model: EmployeeModel,
    select: "firstName lastName designation employeeType"
  });
  if (!attendance) throw new NotFoundException("Attendance not found");
  return attendance;
};

export const searchAttendanceService = async (firstName?: string, lastName?: string): Promise<IAttendance[]> => {
  const matchStage: any = {};

  if (firstName) {
    matchStage['employee.firstName'] = { $regex: firstName, $options: 'i' };
  }

  if (lastName) {
    matchStage['employee.lastName'] = { $regex: lastName, $options: 'i' };
  }

  const result = await Attendance.aggregate([
    {
      $lookup: {
        from: "employees",
        localField: "employeeId",
        foreignField: "_id",
        as: "employee"
      }
    },
    { $unwind: "$employee" },
    { $match: matchStage },
    {
      $project: {
        _id: 1,
        checkInTime: 1,
        status: 1,
        date: 1,
        employeeId: {
          _id: "$employee._id",
          firstName: "$employee.firstName",
          lastName: "$employee.lastName",
          designation: "$employee.designation",
          employeeType: "$employee.employeeType"
        }
      }
    }
  ]);

  return result;
};
