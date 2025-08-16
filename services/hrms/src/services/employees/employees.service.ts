import EmployeeModel, { EmployeeDocument } from "../../models/employees/employee.model";
import settingsModel from "../../models/app/settings.model";
import { NotFoundException, BadRequestException } from "../../utils/app-error";

export const createEmployeeService = async (
  data: Partial<EmployeeDocument>,
  userId: string
) => {
  const existingEmployee = await EmployeeModel.findOne({
    emailAddress: data.emailAddress,
    createdBy: userId
  });

  if (existingEmployee) {
    throw new BadRequestException('Employee with this email already exists in your records');
  }

  const employee = await EmployeeModel.create({
    ...data,
    createdBy: userId
  });

  return employee;
}

export const getAllEmployeesService = async (userId: string) => {
  return EmployeeModel.find({ createdBy: userId });
}

export const getEmployeeByIdService = async (
  id: string,
  userId: string
) => {
  const employee = await EmployeeModel.findOne({ _id: id, createdBy: userId });
  if (!employee) throw new NotFoundException('Employee not found or access denied');
  return employee;
}

export const updateEmployeeService = async (
  id: string,
  data: Partial<EmployeeDocument>,
  userId: string
) => {
  // Check if the employee exists and belongs to the user
  const existingEmployee = await EmployeeModel.findOne({ _id: id, createdBy: userId });
  if (!existingEmployee) {
    throw new NotFoundException('Employee not found or access denied');
  }

  // Prevent changing the createdBy field
  const { createdBy, ...updateData } = data;

  const employee = await EmployeeModel.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );

  return employee;
}

export const deleteEmployeeService = async (
  id: string,
  userId: string
) => {
  const employee = await EmployeeModel.findOneAndDelete({
    _id: id,
    createdBy: userId
  });

  if (!employee) {
    throw new NotFoundException('Employee not found or access denied');
  }

  return employee;
}