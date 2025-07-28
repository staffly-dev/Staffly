import EmployeeModel, { EmployeeDocument } from "../../models/employees/employee.model";
import settingsModel from "../../models/app/settings.model";
import { NotFoundException, BadRequestException } from "../../utils/app-error";

export const createEmployeeService = async (
  data: Partial<EmployeeDocument>
) => {
  const existingEmployee = await EmployeeModel.findOne({ emailAddress: data.emailAddress });
  if (existingEmployee) throw new BadRequestException("Employee with this email already exists");

  const employee = new EmployeeModel(data);
  await employee.save();

  const settings = new settingsModel({
    userId: employee._id,
    appearance: 'light',
    language: 'en',
    twoFactorAuth: false,
    mobileNotifications: true,
    desktopNotifications: true,
    emailNotifications: true,
  });
  await settings.save();
  return employee;
}

export const getAllEmployeesService = async () => {
  return EmployeeModel.find();
}

export const getEmployeeByIdService = async (
  id: string
) => {
  const employee = await EmployeeModel.findById(id);
  if (!employee) throw new NotFoundException("Employee not found");

  return employee;
}

export const updateEmployeeService = async (
  id: string,
  data: Partial<EmployeeDocument>
) => {
  const employee = await EmployeeModel.findByIdAndUpdate(id, data, { new: true });
  if (!employee) throw new NotFoundException("Employee not found");
  return employee;
}

export const deleteEmployeeService = async (
  id: string
) => {
  const employee = await EmployeeModel.findByIdAndDelete(id);
  if (!employee) throw new NotFoundException("Employee not found");
  return employee;
}