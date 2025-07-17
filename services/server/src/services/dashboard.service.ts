import Attendance, { IAttendance } from "../models/attendance.model";
import EmployeeModel from "../models/employee.model";
import UserModel from "../models/user.model";




export const dashboardService =async () => {
    const totalEmployees = await EmployeeModel.countDocuments();
    const totalAttendance = await Attendance.countDocuments();
    const totelApplicant = await UserModel.countDocuments();
    const totalProgects =0


    return {
        totalEmployees,
        totalAttendance,
        totelApplicant,
        totalProgects
    }
}

export const getAllAttendanceDashboardService = async (): Promise<IAttendance[]> => {

    return await Attendance.find().populate({
      path: "employeeId",
      model: EmployeeModel,
      select: "firstName lastName designation employeeType"
    });
  
  };

