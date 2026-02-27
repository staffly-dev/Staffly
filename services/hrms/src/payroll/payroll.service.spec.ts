/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { PayrollService } from './payroll.service';
import { getModelToken } from '@nestjs/mongoose';
import { Payroll } from './schemas/payroll.schema';
import { Employee } from '../employees/schemas/employee.schema';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { RpcException } from '@nestjs/microservices';
import { Types } from 'mongoose';

describe('PayrollService', () => {
  let service: PayrollService;
  let payrollModelMock: jest.Mock & {
    findOne: jest.Mock;
    create: jest.Mock;
    find: jest.Mock;
    findOneAndUpdate: jest.Mock;
    findOneAndDelete: jest.Mock;
    aggregate: jest.Mock;
  };
  let employeeModelMock: jest.Mock & {
    findOne: jest.Mock;
  };

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockEmployeeId = '507f1f77bcf86cd799439012';
  const mockPayrollId = '507f1f77bcf86cd799439013';
  const mockEmployee = {
    _id: mockEmployeeId,
    firstName: 'John',
    lastName: 'Doe',
    profilePicture: 'profile.jpg',
    createdBy: mockUserId,
  };
  const mockPayroll = {
    _id: mockPayrollId,
    employeeId: mockEmployeeId,
    ctc: '60000',
    salaryByMonth: '5000',
    deduction: '500',
    createdBy: mockUserId,
  };

  const mockUpdatePayrollDto: UpdatePayrollDto = {
    ctc: '70000',
    salaryByMonth: '5833',
    deduction: '600',
  };

  beforeEach(async () => {
    payrollModelMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOneAndDelete: jest.fn(),
      aggregate: jest.fn(),
    } as any;

    employeeModelMock = {
      findOne: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        {
          provide: getModelToken(Payroll.name),
          useValue: payrollModelMock,
        },
        {
          provide: getModelToken(Employee.name),
          useValue: employeeModelMock,
        },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create payroll successfully', async () => {
      payrollModelMock.findOne.mockResolvedValue(null);
      payrollModelMock.create.mockResolvedValue({
        ...mockPayroll,
        populate: jest.fn().mockResolvedValue({
          ...mockPayroll,
          employeeId: mockEmployee,
        }),
      });

      const result = await service.create(
        mockEmployeeId,
        '60000',
        '5000',
        '500',
        mockUserId,
      );

      expect(payrollModelMock.findOne).toHaveBeenCalledWith({
        employeeId: mockEmployeeId,
        createdBy: mockUserId,
      });
      expect(payrollModelMock.create).toHaveBeenCalledWith({
        employeeId: mockEmployeeId,
        ctc: '60000',
        salaryByMonth: '5000',
        deduction: '500',
        createdBy: mockUserId,
      });
      expect(result).toEqual({
        ...mockPayroll,
        employeeId: mockEmployee,
      });
    });

    it('should throw RpcException if payroll already exists for employee', async () => {
      payrollModelMock.findOne.mockResolvedValue(mockPayroll);

      await expect(
        service.create(mockEmployeeId, '60000', '5000', '500', mockUserId),
      ).rejects.toThrow(RpcException);
      expect(payrollModelMock.findOne).toHaveBeenCalledWith({
        employeeId: mockEmployeeId,
        createdBy: mockUserId,
      });
    });

    it('should handle database errors', async () => {
      payrollModelMock.findOne.mockRejectedValue(new Error('Database error'));

      await expect(
        service.create(mockEmployeeId, '60000', '5000', '500', mockUserId),
      ).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all payroll records for user with employee population', async () => {
      const mockPayrolls = [mockPayroll];
      payrollModelMock.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockPayrolls),
          }),
        }),
      });

      const result = await service.findAll(mockUserId);

      expect(payrollModelMock.find).toHaveBeenCalledWith({
        createdBy: mockUserId,
      });
      expect(result).toEqual(mockPayrolls);
    });

    it('should handle empty payroll list', async () => {
      payrollModelMock.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const result = await service.findAll(mockUserId);

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      payrollModelMock.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockRejectedValue(new Error('Database error')),
          }),
        }),
      });

      await expect(service.findAll(mockUserId)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('search', () => {
    it('should search payroll records with first name filter', async () => {
      const mockSearchResults = [mockPayroll];
      payrollModelMock.aggregate.mockResolvedValue(mockSearchResults);

      const result = await service.search(mockUserId, 'John', undefined);

      expect(payrollModelMock.aggregate).toHaveBeenCalledWith([
        { $match: { createdBy: new Types.ObjectId(mockUserId) } },
        {
          $lookup: {
            from: 'employees',
            localField: 'employeeId',
            foreignField: '_id',
            as: 'employee',
          },
        },
        { $unwind: '$employee' },
        { $match: { 'employee.firstName': { $regex: 'John', $options: 'i' } } },
        { $addFields: { employeeId: '$employee' } },
        { $project: { employee: 0 } },
      ]);
      expect(result).toEqual(mockSearchResults);
    });

    it('should search payroll records with last name filter', async () => {
      const mockSearchResults = [mockPayroll];
      payrollModelMock.aggregate.mockResolvedValue(mockSearchResults);

      const result = await service.search(mockUserId, undefined, 'Doe');

      expect(payrollModelMock.aggregate).toHaveBeenCalledWith([
        { $match: { createdBy: new Types.ObjectId(mockUserId) } },
        {
          $lookup: {
            from: 'employees',
            localField: 'employeeId',
            foreignField: '_id',
            as: 'employee',
          },
        },
        { $unwind: '$employee' },
        { $match: { 'employee.lastName': { $regex: 'Doe', $options: 'i' } } },
        { $addFields: { employeeId: '$employee' } },
        { $project: { employee: 0 } },
      ]);
      expect(result).toEqual(mockSearchResults);
    });

    it('should search payroll records with both first and last name filters', async () => {
      const mockSearchResults = [mockPayroll];
      payrollModelMock.aggregate.mockResolvedValue(mockSearchResults);

      const result = await service.search(mockUserId, 'John', 'Doe');

      expect(payrollModelMock.aggregate).toHaveBeenCalledWith([
        { $match: { createdBy: new Types.ObjectId(mockUserId) } },
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
            'employee.firstName': { $regex: 'John', $options: 'i' },
            'employee.lastName': { $regex: 'Doe', $options: 'i' },
          },
        },
        { $addFields: { employeeId: '$employee' } },
        { $project: { employee: 0 } },
      ]);
      expect(result).toEqual(mockSearchResults);
    });

    it('should search payroll records without name filters', async () => {
      const mockSearchResults = [mockPayroll];
      payrollModelMock.aggregate.mockResolvedValue(mockSearchResults);

      const result = await service.search(mockUserId);

      expect(payrollModelMock.aggregate).toHaveBeenCalledWith([
        { $match: { createdBy: new Types.ObjectId(mockUserId) } },
        {
          $lookup: {
            from: 'employees',
            localField: 'employeeId',
            foreignField: '_id',
            as: 'employee',
          },
        },
        { $unwind: '$employee' },
        { $addFields: { employeeId: '$employee' } },
        { $project: { employee: 0 } },
      ]);
      expect(result).toEqual(mockSearchResults);
    });

    it('should handle database errors', async () => {
      payrollModelMock.aggregate.mockRejectedValue(new Error('Database error'));

      await expect(service.search(mockUserId)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('update', () => {
    it('should update payroll successfully', async () => {
      const updatedPayroll = { ...mockPayroll, ...mockUpdatePayrollDto };
      payrollModelMock.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedPayroll),
        }),
      });

      const result = await service.update(
        mockPayrollId,
        mockUserId,
        mockUpdatePayrollDto,
      );

      expect(payrollModelMock.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockPayrollId, createdBy: mockUserId },
        expect.objectContaining({
          ctc: '70000',
          salaryByMonth: '5833',
          deduction: '600',
        }),
        { new: true },
      );
      expect(result).toEqual(updatedPayroll);
    });

    it('should validate employee when updating employeeId', async () => {
      const updateDtoWithEmployee = {
        ...mockUpdatePayrollDto,
        employeeId: mockEmployeeId,
      };
      employeeModelMock.findOne.mockResolvedValue(mockEmployee);
      payrollModelMock.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPayroll),
        }),
      });

      await service.update(mockPayrollId, mockUserId, updateDtoWithEmployee);

      expect(employeeModelMock.findOne).toHaveBeenCalledWith({
        _id: mockEmployeeId,
        createdBy: mockUserId,
      });
    });

    it('should throw RpcException when employee not found during employeeId update', async () => {
      const updateDtoWithEmployee = {
        ...mockUpdatePayrollDto,
        employeeId: mockEmployeeId,
      };
      employeeModelMock.findOne.mockResolvedValue(null);

      await expect(
        service.update(mockPayrollId, mockUserId, updateDtoWithEmployee),
      ).rejects.toThrow(RpcException);
    });

    it('should handle object salaryByMonth and deduction fields', async () => {
      const updateDtoWithObjects = {
        salaryByMonth: { basic: 4000, bonus: 1000 },
        deduction: { tax: 500, insurance: 100 },
      } as any;
      payrollModelMock.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPayroll),
        }),
      });

      await service.update(mockPayrollId, mockUserId, updateDtoWithObjects);

      expect(payrollModelMock.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: mockPayrollId, createdBy: mockUserId },
        expect.objectContaining({
          salaryByMonth: JSON.stringify({ basic: 4000, bonus: 1000 }),
          deduction: JSON.stringify({ tax: 500, insurance: 100 }),
        }),
        { new: true },
      );
    });

    it('should throw RpcException if payroll not found', async () => {
      payrollModelMock.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(
        service.update(mockPayrollId, mockUserId, mockUpdatePayrollDto),
      ).rejects.toThrow(RpcException);
    });

    it('should handle database errors', async () => {
      payrollModelMock.findOneAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('Database error')),
        }),
      });

      await expect(
        service.update(mockPayrollId, mockUserId, mockUpdatePayrollDto),
      ).rejects.toThrow('Database error');
    });
  });

  describe('remove', () => {
    it('should delete payroll successfully', async () => {
      payrollModelMock.findOneAndDelete.mockResolvedValue(mockPayroll);

      const result = await service.remove(mockPayrollId, mockUserId);

      expect(payrollModelMock.findOneAndDelete).toHaveBeenCalledWith({
        _id: mockPayrollId,
        createdBy: mockUserId,
      });
      expect(result).toEqual(mockPayroll);
    });

    it('should throw RpcException if payroll not found', async () => {
      payrollModelMock.findOneAndDelete.mockResolvedValue(null);

      await expect(service.remove(mockPayrollId, mockUserId)).rejects.toThrow(
        RpcException,
      );
    });

    it('should handle database errors', async () => {
      payrollModelMock.findOneAndDelete.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.remove(mockPayrollId, mockUserId)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
