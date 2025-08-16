import Payroll from "../../models/employees/payroll.model";
import { BadRequestException, NotFoundException } from "../../utils/app-error";
import mongoose from "mongoose";

export const createPayrollService = async (
  employeeId: string,
  ctc: number,
  salaryByMonth: any[],
  deduction: any,
  userId: string
) => {
  const existingEmployee = await Payroll.findOne({ employeeId, createdBy: userId });
  if (existingEmployee) {
    throw new BadRequestException('Employee payroll already exists');
  }

  const payroll = new Payroll({
    employeeId: employeeId,
    ctc,
    salaryByMonth,
    deduction,
    createdBy: userId
  });
  return payroll;
};

export const getAllPayrollService = async (userId: string) => {
  const payroll = await Payroll.find({
    createdBy: userId
  });
  return payroll;
};

export const searchPayrollService = async (
  userId: string,
  firstName: string,
  lastName: string
) => {
  const query: any = {
    createdBy: new mongoose.Types.ObjectId(userId)
  };

  if (firstName || lastName) {
    query.employeeId = {};
    if (firstName) {
      query.employeeId.firstName = { $regex: firstName, $options: 'i' };
    }
    if (lastName) {
      query.employeeId.lastName = { $regex: lastName, $options: 'i' };
    }
  }

  const pipeline: any[] = [
    {
      $match: { createdBy: new mongoose.Types.ObjectId(userId) }
    },
    {
      $lookup: {
        from: 'employees',
        localField: 'employeeId',
        foreignField: '_id',
        as: 'employee',
      },
    },
    { $unwind: '$employee' },
    {
      $match: {
        ...(firstName && { 'employee.firstName': { $regex: firstName, $options: 'i' } }),
        ...(lastName && { 'employee.lastName': { $regex: lastName, $options: 'i' } })
      }
    },
    {
      $addFields: {
        employeeId: '$employee'
      }
    },
    {
      $project: {
        employee: 0
      }
    }
  ];

  const result = await Payroll.aggregate(pipeline);
  return result;
};

export const updatePayrollService = async (
  id: string,
  employeeId: string,
  ctc: number,
  salaryByMonth: any[],
  deduction: any,
  userId: string
) => {
  const updateData: any = { ctc, salaryByMonth, deduction };
  if (employeeId) {
    updateData.employeeId = new mongoose.Types.ObjectId(employeeId);
  }

  const payroll = await Payroll.findOneAndUpdate(
    { _id: id, createdBy: userId },
    updateData,
    { new: true }
  ).populate('employeeId', 'firstName lastName');
  return payroll;
};

export const deletePayrollService = async (id: string, userId: string) => {
  const payroll = await Payroll.findOneAndDelete({ _id: id, createdBy: userId });

  if (!payroll) {
    throw new NotFoundException('Payroll not found or access denied');
  }

  return payroll;
};