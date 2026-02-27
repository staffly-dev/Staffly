/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { PayrollController } from './payroll.controller';
import { PayrollService } from './payroll.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { getModelToken } from '@nestjs/mongoose';
import { Employee } from '../employees/schemas/employee.schema';
import { NotFoundException } from '@nestjs/common';

describe('PayrollController', () => {
  let controller: PayrollController;
  let mockPayrollService: any;
  let mockEmployeeModel: any;

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockEmployeeId = '507f1f77bcf86cd799439012';
  const mockPayrollId = '507f1f77bcf86cd799439013';
  const mockEmployee = {
    _id: mockEmployeeId,
    firstName: 'John',
    lastName: 'Doe',
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

  const mockCreatePayrollDto: CreatePayrollDto = {
    employeeId: mockEmployeeId,
    ctc: '60000',
    salaryByMonth: '5000',
    deduction: '500',
  };

  const mockUpdatePayrollDto: UpdatePayrollDto = {
    ctc: '70000',
    salaryByMonth: '5833',
    deduction: '600',
  };

  beforeEach(async () => {
    mockPayrollService = {
      create: jest.fn(),
      findAll: jest.fn(),
      search: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    mockEmployeeModel = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollController],
      providers: [
        {
          provide: PayrollService,
          useValue: mockPayrollService,
        },
        {
          provide: getModelToken(Employee.name),
          useValue: mockEmployeeModel,
        },
      ],
    }).compile();

    controller = module.get<PayrollController>(PayrollController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should validate employee and create payroll successfully', async () => {
      const payload = {
        dto: mockCreatePayrollDto,
        user_id: mockUserId,
      };
      const expectedResult = {
        message: 'Payroll created successfully',
        payroll: { ...mockPayroll, employeeId: mockEmployee },
      };

      mockEmployeeModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEmployee),
      });
      mockPayrollService.create.mockResolvedValue({
        ...mockPayroll,
        employeeId: mockEmployee,
      });

      const result = await controller.create(payload);

      expect(mockEmployeeModel.findOne).toHaveBeenCalledWith({
        _id: mockEmployeeId,
        createdBy: mockUserId,
      });
      expect(mockPayrollService.create).toHaveBeenCalledWith(
        mockEmployeeId,
        '60000',
        '5000',
        '500',
        mockUserId,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if employee not found', async () => {
      const payload = {
        dto: mockCreatePayrollDto,
        user_id: mockUserId,
      };

      mockEmployeeModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(controller.create(payload)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockEmployeeModel.findOne).toHaveBeenCalledWith({
        _id: mockEmployeeId,
        createdBy: mockUserId,
      });
    });

    it('should handle service errors gracefully', async () => {
      const payload = {
        dto: mockCreatePayrollDto,
        user_id: mockUserId,
      };

      mockEmployeeModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEmployee),
      });
      mockPayrollService.create.mockRejectedValue(new Error('Service error'));

      await expect(controller.create(payload)).rejects.toThrow('Service error');
    });
  });

  describe('findAll', () => {
    it('should call payrollService.findAll with user_id', async () => {
      const payload = { user_id: mockUserId };
      const mockPayrolls = [mockPayroll];
      const expectedResult = {
        message: 'Payroll fetched successfully',
        payroll: mockPayrolls,
      };

      mockPayrollService.findAll.mockResolvedValue(mockPayrolls);

      const result = await controller.findAll(payload);

      expect(mockPayrollService.findAll).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty payroll list', async () => {
      const payload = { user_id: mockUserId };
      const expectedResult = {
        message: 'Payroll fetched successfully',
        payroll: [],
      };

      mockPayrollService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(payload);

      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors gracefully', async () => {
      const payload = { user_id: mockUserId };

      mockPayrollService.findAll.mockRejectedValue(new Error('Service error'));

      await expect(controller.findAll(payload)).rejects.toThrow(
        'Service error',
      );
      expect(mockPayrollService.findAll).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('search', () => {
    it('should call payrollService.search with user_id and name filters', async () => {
      const payload = {
        user_id: mockUserId,
        firstName: 'John',
        lastName: 'Doe',
      };
      const mockSearchResults = [mockPayroll];
      const expectedResult = {
        message: 'Payroll fetched successfully',
        payroll: mockSearchResults,
      };

      mockPayrollService.search.mockResolvedValue(mockSearchResults);

      const result = await controller.search(payload);

      expect(mockPayrollService.search).toHaveBeenCalledWith(
        mockUserId,
        'John',
        'Doe',
      );
      expect(result).toEqual(expectedResult);
    });

    it('should call payrollService.search with only first name', async () => {
      const payload = {
        user_id: mockUserId,
        firstName: 'John',
      };
      const mockSearchResults = [mockPayroll];

      mockPayrollService.search.mockResolvedValue(mockSearchResults);

      await controller.search(payload);

      expect(mockPayrollService.search).toHaveBeenCalledWith(
        mockUserId,
        'John',
        undefined,
      );
    });

    it('should call payrollService.search with only last name', async () => {
      const payload = {
        user_id: mockUserId,
        lastName: 'Doe',
      };
      const mockSearchResults = [mockPayroll];

      mockPayrollService.search.mockResolvedValue(mockSearchResults);

      await controller.search(payload);

      expect(mockPayrollService.search).toHaveBeenCalledWith(
        mockUserId,
        undefined,
        'Doe',
      );
    });

    it('should call payrollService.search without name filters', async () => {
      const payload = { user_id: mockUserId };
      const mockSearchResults = [mockPayroll];

      mockPayrollService.search.mockResolvedValue(mockSearchResults);

      await controller.search(payload);

      expect(mockPayrollService.search).toHaveBeenCalledWith(
        mockUserId,
        undefined,
        undefined,
      );
    });

    it('should handle service errors gracefully', async () => {
      const payload = { user_id: mockUserId };

      mockPayrollService.search.mockRejectedValue(new Error('Service error'));

      await expect(controller.search(payload)).rejects.toThrow('Service error');
      expect(mockPayrollService.search).toHaveBeenCalledWith(
        mockUserId,
        undefined,
        undefined,
      );
    });
  });

  describe('update', () => {
    it('should call payrollService.update with id, user_id and dto', async () => {
      const payload = {
        id: mockPayrollId,
        dto: mockUpdatePayrollDto,
        user_id: mockUserId,
      };
      const updatedPayroll = { ...mockPayroll, ...mockUpdatePayrollDto };
      const expectedResult = {
        message: 'Payroll updated successfully',
        payroll: updatedPayroll,
      };

      mockPayrollService.update.mockResolvedValue(updatedPayroll);

      const result = await controller.update(payload);

      expect(mockPayrollService.update).toHaveBeenCalledWith(
        mockPayrollId,
        mockUserId,
        mockUpdatePayrollDto,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors gracefully', async () => {
      const payload = {
        id: mockPayrollId,
        dto: mockUpdatePayrollDto,
        user_id: mockUserId,
      };

      mockPayrollService.update.mockRejectedValue(new Error('Service error'));

      await expect(controller.update(payload)).rejects.toThrow('Service error');
      expect(mockPayrollService.update).toHaveBeenCalledWith(
        mockPayrollId,
        mockUserId,
        mockUpdatePayrollDto,
      );
    });
  });

  describe('remove', () => {
    it('should call payrollService.remove with id and user_id', async () => {
      const payload = {
        id: mockPayrollId,
        user_id: mockUserId,
      };
      const expectedResult = {
        message: 'Payroll deleted successfully',
      };

      mockPayrollService.remove.mockResolvedValue(mockPayroll);

      const result = await controller.remove(payload);

      expect(mockPayrollService.remove).toHaveBeenCalledWith(
        mockPayrollId,
        mockUserId,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors gracefully', async () => {
      const payload = {
        id: mockPayrollId,
        user_id: mockUserId,
      };

      mockPayrollService.remove.mockRejectedValue(new Error('Service error'));

      await expect(controller.remove(payload)).rejects.toThrow('Service error');
      expect(mockPayrollService.remove).toHaveBeenCalledWith(
        mockPayrollId,
        mockUserId,
      );
    });
  });
});
