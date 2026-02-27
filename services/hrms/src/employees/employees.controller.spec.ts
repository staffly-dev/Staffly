/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from './employees.controller';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

describe('EmployeesController', () => {
  let controller: EmployeesController;
  let mockEmployeesService: any;

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockEmployeeId = '507f1f77bcf86cd799439012';
  const mockEmployee = {
    _id: mockEmployeeId,
    firstName: 'John',
    lastName: 'Doe',
    emailAddress: 'john@example.com',
    createdBy: mockUserId,
  };

  const mockCreateEmployeeDto: CreateEmployeeDto = {
    firstName: 'John',
    lastName: 'Doe',
    mobileNumber: '1234567890',
    emailAddress: 'john@example.com',
    dateOfBrith: '1990-01-01',
    maritalStatus: 'Single',
    gender: 'Male',
    nationality: 'American',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    userName: 'johndoe',
    employeeType: 'Full-time',
    department: 'Engineering',
    designation: 'Developer',
    workingDays: 'Mon-Fri',
    joiningAt: '2023-01-01',
    officeLocation: 'NYC',
  };

  const mockUpdateEmployeeDto: UpdateEmployeeDto = {
    firstName: 'Jane',
    designation: 'Senior Developer',
  };

  beforeEach(async () => {
    mockEmployeesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmployeesController],
      providers: [
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile();

    controller = module.get<EmployeesController>(EmployeesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call employeesService.create with dto and user_id', async () => {
      const payload = {
        dto: mockCreateEmployeeDto,
        user_id: mockUserId,
      };
      const expectedResult = {
        message: 'Employee created successfully',
        employee: mockEmployee,
      };

      mockEmployeesService.create.mockResolvedValue(mockEmployee);

      const result = await controller.create(payload);

      expect(mockEmployeesService.create).toHaveBeenCalledWith(
        mockCreateEmployeeDto,
        mockUserId,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors gracefully', async () => {
      const payload = {
        dto: mockCreateEmployeeDto,
        user_id: mockUserId,
      };

      mockEmployeesService.create.mockRejectedValue(new Error('Service error'));

      await expect(controller.create(payload)).rejects.toThrow('Service error');
      expect(mockEmployeesService.create).toHaveBeenCalledWith(
        mockCreateEmployeeDto,
        mockUserId,
      );
    });
  });

  describe('findAll', () => {
    it('should call employeesService.findAll with user_id', async () => {
      const payload = { user_id: mockUserId };
      const mockEmployees = [mockEmployee];
      const expectedResult = {
        message: 'Employees fetched successfully',
        employees: mockEmployees,
      };

      mockEmployeesService.findAll.mockResolvedValue(mockEmployees);

      const result = await controller.findAll(payload);

      expect(mockEmployeesService.findAll).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty employee list', async () => {
      const payload = { user_id: mockUserId };
      const expectedResult = {
        message: 'Employees fetched successfully',
        employees: [],
      };

      mockEmployeesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(payload);

      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors gracefully', async () => {
      const payload = { user_id: mockUserId };

      mockEmployeesService.findAll.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.findAll(payload)).rejects.toThrow(
        'Service error',
      );
      expect(mockEmployeesService.findAll).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('findOne', () => {
    it('should call employeesService.findOne with id and user_id', async () => {
      const payload = {
        id: mockEmployeeId,
        user_id: mockUserId,
      };
      const expectedResult = {
        message: 'Employee fetched successfully',
        employee: mockEmployee,
      };

      mockEmployeesService.findOne.mockResolvedValue(mockEmployee);

      const result = await controller.findOne(payload);

      expect(mockEmployeesService.findOne).toHaveBeenCalledWith(
        mockEmployeeId,
        mockUserId,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors gracefully', async () => {
      const payload = {
        id: mockEmployeeId,
        user_id: mockUserId,
      };

      mockEmployeesService.findOne.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.findOne(payload)).rejects.toThrow(
        'Service error',
      );
      expect(mockEmployeesService.findOne).toHaveBeenCalledWith(
        mockEmployeeId,
        mockUserId,
      );
    });
  });

  describe('update', () => {
    it('should call employeesService.update with id, dto and user_id', async () => {
      const payload = {
        id: mockEmployeeId,
        dto: mockUpdateEmployeeDto,
        user_id: mockUserId,
      };
      const updatedEmployee = { ...mockEmployee, ...mockUpdateEmployeeDto };
      const expectedResult = {
        message: 'Employee updated successfully',
        employee: updatedEmployee,
      };

      mockEmployeesService.update.mockResolvedValue(updatedEmployee);

      const result = await controller.update(payload);

      expect(mockEmployeesService.update).toHaveBeenCalledWith(
        mockEmployeeId,
        mockUpdateEmployeeDto,
        mockUserId,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors gracefully', async () => {
      const payload = {
        id: mockEmployeeId,
        dto: mockUpdateEmployeeDto,
        user_id: mockUserId,
      };

      mockEmployeesService.update.mockRejectedValue(new Error('Service error'));

      await expect(controller.update(payload)).rejects.toThrow('Service error');
      expect(mockEmployeesService.update).toHaveBeenCalledWith(
        mockEmployeeId,
        mockUpdateEmployeeDto,
        mockUserId,
      );
    });
  });

  describe('remove', () => {
    it('should call employeesService.remove with id and user_id', async () => {
      const payload = {
        id: mockEmployeeId,
        user_id: mockUserId,
      };
      const expectedResult = {
        message: 'Employee deleted successfully',
      };

      mockEmployeesService.remove.mockResolvedValue(mockEmployee);

      const result = await controller.remove(payload);

      expect(mockEmployeesService.remove).toHaveBeenCalledWith(
        mockEmployeeId,
        mockUserId,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors gracefully', async () => {
      const payload = {
        id: mockEmployeeId,
        user_id: mockUserId,
      };

      mockEmployeesService.remove.mockRejectedValue(new Error('Service error'));

      await expect(controller.remove(payload)).rejects.toThrow('Service error');
      expect(mockEmployeesService.remove).toHaveBeenCalledWith(
        mockEmployeeId,
        mockUserId,
      );
    });
  });
});
