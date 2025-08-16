import payrollModel, { IPayroll } from "../../models/employees/payroll.model";

export const createPayrollService = async (employeeId: string, ctc: string, salaryByMonth: string, deduction: string) => {
  const payroll = await payrollModel.create({ employeeId, ctc, salaryByMonth, deduction });
  return payroll;
};

export const getAllPayrollService = async () => {
  return await payrollModel
    .find()
    .populate({
      path: 'employeeId',
      select: 'firstName lastName profilePicture'
    });
};

export const searchPayrollService = async (firstName?: string, lastName?: string): Promise<IPayroll[]> => {
  const matchStage: any = {};

  if (firstName) {
    matchStage['employee.firstName'] = { $regex: firstName, $options: 'i' };
  }

  if (lastName) {
    matchStage['employee.lastName'] = { $regex: lastName, $options: 'i' };
  }

  const result = await payrollModel.aggregate([
    {
      $lookup: {
        from: 'employees',
        localField: 'employeeId',
        foreignField: '_id',
        as: 'employee',
      },
    },
    {
      $match: matchStage,
    },
  ]);

  return result;
};

export const updatePayrollService = async (id: string, employeeId: string, ctc: string, salaryByMonth: string, deduction: string) => {
  const payroll = await payrollModel.findByIdAndUpdate(id, { employeeId, ctc, salaryByMonth, deduction }, { new: true, runValidators: true });
  return payroll;
};

export const deletePayrollService = async (id: string) => {
  const payroll = await payrollModel.findByIdAndDelete(id);
  return payroll;
};