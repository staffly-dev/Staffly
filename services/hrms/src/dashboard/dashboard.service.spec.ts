/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { getModelToken } from '@nestjs/mongoose';
import { Employee } from '../employees/schemas/employee.schema';
import { Attendance } from '../attendance/schemas/attendance.schema';

describe('DashboardService', () => {
  let service: DashboardService;
  let employeeModelMock: jest.Mock & {
    countDocuments: jest.Mock;
    find: jest.Mock;
    distinct: jest.Mock;
  };
  let attendanceModelMock: jest.Mock & {
    countDocuments: jest.Mock;
    find: jest.Mock;
    populate: jest.Mock;
    exec: jest.Mock;
  };

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockEmployeeId = '507f1f77bcf86cd799439012';
  const mockEmployees = [
    {
      _id: mockEmployeeId,
      firstName: 'John',
      lastName: 'Doe',
      createdBy: mockUserId,
    },
    {
      _id: '507f1f77bcf86cd799439013',
      firstName: 'Jane',
      lastName: 'Smith',
      createdBy: mockUserId,
    },
  ];
  const mockAttendance = [
    {
      _id: '507f1f77bcf86cd799439014',
      employeeId: mockEmployeeId,
      date: new Date(),
    },
    {
      _id: '507f1f77bcf86cd799439015',
      employeeId: '507f1f77bcf86cd799439013',
      date: new Date(),
    },
  ];

  beforeEach(async () => {
    employeeModelMock = {
      countDocuments: jest.fn(),
      find: jest.fn(),
      distinct: jest.fn(),
    } as any;

    attendanceModelMock = {
      countDocuments: jest.fn(),
      find: jest.fn(),
      populate: jest.fn(),
      exec: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getModelToken(Employee.name),
          useValue: employeeModelMock,
        },
        {
          provide: getModelToken(Attendance.name),
          useValue: attendanceModelMock,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return dashboard statistics for user', async () => {
      employeeModelMock.countDocuments.mockResolvedValue(mockEmployees.length);
      employeeModelMock.find.mockReturnValue({
        distinct: jest
          .fn()
          .mockResolvedValue([mockEmployeeId, '507f1f77bcf86cd799439013']),
      });
      attendanceModelMock.countDocuments.mockResolvedValue(
        mockAttendance.length,
      );

      const result = await service.getStats(mockUserId);

      expect(employeeModelMock.countDocuments).toHaveBeenCalledWith({
        createdBy: mockUserId,
      });
      expect(employeeModelMock.find).toHaveBeenCalledWith({
        createdBy: mockUserId,
      });
      expect(attendanceModelMock.countDocuments).toHaveBeenCalledWith({
        employeeId: { $in: [mockEmployeeId, '507f1f77bcf86cd799439013'] },
      });
      expect(result).toEqual({
        totalEmployees: mockEmployees.length,
        totalAttendance: mockAttendance.length,
        totelApplicant: 0,
        totalProgects: 0,
      });
    });

    it('should handle empty employee list', async () => {
      employeeModelMock.countDocuments.mockResolvedValue(0);
      employeeModelMock.find.mockReturnValue({
        distinct: jest.fn().mockResolvedValue([]),
      });
      attendanceModelMock.countDocuments.mockResolvedValue(0);

      const result = await service.getStats(mockUserId);

      expect(result).toEqual({
        totalEmployees: 0,
        totalAttendance: 0,
        totelApplicant: 0,
        totalProgects: 0,
      });
    });

    it('should throw RpcException on database error', async () => {
      employeeModelMock.countDocuments.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.getStats(mockUserId)).rejects.toThrow(Error);
    });
  });

  describe('getAllAttendanceForDashboard', () => {
    it('should return all attendance for user with employee population', async () => {
      employeeModelMock.find.mockReturnValue({
        distinct: jest
          .fn()
          .mockResolvedValue([mockEmployeeId, '507f1f77bcf86cd799439013']),
      });

      const mockPopulatedAttendance = [
        {
          _id: '507f1f77bcf86cd799439014',
          employeeId: {
            _id: mockEmployeeId,
            firstName: 'John',
            lastName: 'Doe',
            designation: 'Developer',
            employeeType: 'Full-time',
          },
          date: new Date(),
        },
      ];

      attendanceModelMock.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPopulatedAttendance),
        }),
      });

      const result = await service.getAllAttendanceForDashboard(mockUserId);

      expect(employeeModelMock.find).toHaveBeenCalledWith({
        createdBy: mockUserId,
      });
      expect(attendanceModelMock.find).toHaveBeenCalledWith({
        employeeId: { $in: [mockEmployeeId, '507f1f77bcf86cd799439013'] },
      });
      expect(result).toEqual(mockPopulatedAttendance);
    });

    it('should handle empty attendance list', async () => {
      employeeModelMock.find.mockReturnValue({
        distinct: jest.fn().mockResolvedValue([mockEmployeeId]),
      });

      attendanceModelMock.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.getAllAttendanceForDashboard(mockUserId);

      expect(result).toEqual([]);
    });

    it('should handle empty employee list for attendance', async () => {
      employeeModelMock.find.mockReturnValue({
        distinct: jest.fn().mockResolvedValue([]),
      });

      attendanceModelMock.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await service.getAllAttendanceForDashboard(mockUserId);

      expect(attendanceModelMock.find).toHaveBeenCalledWith({
        employeeId: { $in: [] },
      });
      expect(result).toEqual([]);
    });

    it('should throw RpcException on database error', async () => {
      employeeModelMock.find.mockReturnValue({
        distinct: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(
        service.getAllAttendanceForDashboard(mockUserId),
      ).rejects.toThrow(Error);
    });
  });
});
