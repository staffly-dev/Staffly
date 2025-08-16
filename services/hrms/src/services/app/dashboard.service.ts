import Attendance, { IAttendance } from "../../models/attendance/attendance.model";
import EmployeeModel from "../../models/employees/employee.model";
import UserModel from "../../models/auth/user.model";


export const dashboardService = async (userId: string) => {
  const totalEmployees = await EmployeeModel.countDocuments({ createdBy: userId });
  const employeeIds = await EmployeeModel.find({ createdBy: userId }).distinct('_id');
  const totalAttendance = await Attendance.countDocuments({ employeeId: { $in: employeeIds } });
  const totelApplicant = await UserModel.countDocuments({ 
    createdBy: userId,
    role: 'applicant' 
  });
  
  // Placeholder for projects
  const totalProgects = 0

  return {
    totalEmployees,
    totalAttendance,
    totelApplicant,
    totalProgects
  }
};

export const getAllAttendanceDashboardService = async (userId: string): Promise<IAttendance[]> => {
  // Only get attendance for employees created by this user
  const employeeIds = await EmployeeModel.find({ createdBy: userId }).distinct('_id');
  
  return await Attendance.find({ employeeId: { $in: employeeIds } })
    .populate({
      path: "employeeId",
      model: EmployeeModel,
      match: { createdBy: userId },
      select: "firstName lastName designation employeeType"
    });
};

