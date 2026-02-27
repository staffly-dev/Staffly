/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesService } from './employees.service';
import { getModelToken } from '@nestjs/mongoose';
import { Employee } from './schemas/employee.schema';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { RpcException } from '@nestjs/microservices';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let employeeModelMock: jest.Mock & {
    findOne: jest.Mock;
    create: jest.Mock;
    find: jest.Mock;
    findByIdAndUpdate: jest.Mock;
    findOneAndDelete: jest.Mock;
  };

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockEmployeeId = '507f1f77bcf86cd799439012';
  const mockEmployee = {
    _id: mockEmployeeId,
    firstName: 'John',
    lastName: 'Doe',
    emailAddress: 'john@example.com',
    mobileNumber: '1234567890',
    dateOfBrith: new Date('1990-01-01'),
    joiningAt: new Date('2023-01-01'),
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
    employeeModelMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findOneAndDelete: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        {
          provide: getModelToken(Employee.name),
          useValue: employeeModelMock,
        },
      ],
    }).compile();

    service = module.get<EmployeesService>(EmployeesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create employee successfully', async () => {
      employeeModelMock.findOne.mockResolvedValue(null);
      employeeModelMock.create.mockResolvedValue({
        ...mockCreateEmployeeDto,
        dateOfBrith: new Date(mockCreateEmployeeDto.dateOfBrith),
        joiningAt: new Date(mockCreateEmployeeDto.joiningAt),
        createdBy: mockUserId,
        _id: mockEmployeeId,
      });

      const result = await service.create(mockCreateEmployeeDto, mockUserId);

      expect(employeeModelMock.findOne).toHaveBeenCalledWith({
        emailAddress: mockCreateEmployeeDto.emailAddress,
        createdBy: mockUserId,
      });
      expect(employeeModelMock.create).toHaveBeenCalledWith({
        ...mockCreateEmployeeDto,
        dateOfBrith: new Date(mockCreateEmployeeDto.dateOfBrith),
        joiningAt: new Date(mockCreateEmployeeDto.joiningAt),
        createdBy: mockUserId,
      });
      expect(result).toEqual({
        ...mockCreateEmployeeDto,
        dateOfBrith: new Date(mockCreateEmployeeDto.dateOfBrith),
        joiningAt: new Date(mockCreateEmployeeDto.joiningAt),
        createdBy: mockUserId,
        _id: mockEmployeeId,
      });
    });

    it('should throw RpcException if employee with email already exists', async () => {
      employeeModelMock.findOne.mockResolvedValue(mockEmployee);

      await expect(
        service.create(mockCreateEmployeeDto, mockUserId),
      ).rejects.toThrow(RpcException);
      expect(employeeModelMock.findOne).toHaveBeenCalledWith({
        emailAddress: mockCreateEmployeeDto.emailAddress,
        createdBy: mockUserId,
      });
    });

    it('should handle database errors', async () => {
      employeeModelMock.findOne.mockRejectedValue(new Error('Database error'));

      await expect(
        service.create(mockCreateEmployeeDto, mockUserId),
      ).rejects.toThrow('Database error');
    });
  });

  describe('findAll', () => {
    it('should return all employees for user', async () => {
      const mockEmployees = [mockEmployee];
      employeeModelMock.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEmployees),
      });

      const result = await service.findAll(mockUserId);

      expect(employeeModelMock.find).toHaveBeenCalledWith({
        createdBy: mockUserId,
      });
      expect(result).toEqual(mockEmployees);
    });

    it('should handle empty employee list', async () => {
      employeeModelMock.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll(mockUserId);

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      employeeModelMock.find.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.findAll(mockUserId)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findOne', () => {
    it('should return employee if found and belongs to user', async () => {
      employeeModelMock.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEmployee),
      });

      const result = await service.findOne(mockEmployeeId, mockUserId);

      expect(employeeModelMock.findOne).toHaveBeenCalledWith({
        _id: mockEmployeeId,
        createdBy: mockUserId,
      });
      expect(result).toEqual(mockEmployee);
    });

    it('should throw RpcException if employee not found', async () => {
      employeeModelMock.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(mockEmployeeId, mockUserId)).rejects.toThrow(
        RpcException,
      );
    });

    it('should handle database errors', async () => {
      employeeModelMock.findOne.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.findOne(mockEmployeeId, mockUserId)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('update', () => {
    it('should update employee successfully', async () => {
      const updatedEmployee = { ...mockEmployee, ...mockUpdateEmployeeDto };
      employeeModelMock.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEmployee),
      });
      employeeModelMock.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedEmployee),
      });

      const result = await service.update(
        mockEmployeeId,
        mockUpdateEmployeeDto,
        mockUserId,
      );

      expect(employeeModelMock.findOne).toHaveBeenCalledWith({
        _id: mockEmployeeId,
        createdBy: mockUserId,
      });
      expect(employeeModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
        mockEmployeeId,
        expect.objectContaining(mockUpdateEmployeeDto),
        { new: true },
      );
      expect(result).toEqual(updatedEmployee);
    });

    it('should handle date fields in update', async () => {
      const updateDtoWithDates = {
        ...mockUpdateEmployeeDto,
        dateOfBrith: '1990-01-01',
        joiningAt: '2023-01-01',
      };
      const updatedEmployee = { ...mockEmployee, ...updateDtoWithDates };

      employeeModelMock.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockEmployee),
      });
      employeeModelMock.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedEmployee),
      });

      await service.update(mockEmployeeId, updateDtoWithDates, mockUserId);

      expect(employeeModelMock.findByIdAndUpdate).toHaveBeenCalledWith(
        mockEmployeeId,
        expect.objectContaining({
          ...updateDtoWithDates,
          dateOfBrith: new Date(updateDtoWithDates.dateOfBrith),
          joiningAt: new Date(updateDtoWithDates.joiningAt),
        }),
        { new: true },
      );
    });

    it('should throw RpcException if employee not found', async () => {
      employeeModelMock.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.update(mockEmployeeId, mockUpdateEmployeeDto, mockUserId),
      ).rejects.toThrow(RpcException);
    });

    it('should handle database errors', async () => {
      employeeModelMock.findOne.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(
        service.update(mockEmployeeId, mockUpdateEmployeeDto, mockUserId),
      ).rejects.toThrow('Database error');
    });
  });

  describe('remove', () => {
    it('should delete employee successfully', async () => {
      employeeModelMock.findOneAndDelete.mockResolvedValue(mockEmployee);

      const result = await service.remove(mockEmployeeId, mockUserId);

      expect(employeeModelMock.findOneAndDelete).toHaveBeenCalledWith({
        _id: mockEmployeeId,
        createdBy: mockUserId,
      });
      expect(result).toEqual(mockEmployee);
    });

    it('should throw RpcException if employee not found', async () => {
      employeeModelMock.findOneAndDelete.mockResolvedValue(null);

      await expect(service.remove(mockEmployeeId, mockUserId)).rejects.toThrow(
        RpcException,
      );
    });

    it('should handle database errors', async () => {
      employeeModelMock.findOneAndDelete.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.remove(mockEmployeeId, mockUserId)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
