/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { UserIdDto } from './dto/user-id.dto';

describe('DashboardController', () => {
  let controller: DashboardController;
  let mockDashboardService: any;

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockDashboardStats = {
    totalEmployees: 10,
    totalAttendance: 25,
    totelApplicant: 0,
    totalProgects: 0,
  };
  const mockAttendance = [
    {
      _id: '507f1f77bcf86cd799439014',
      employeeId: {
        _id: '507f1f77bcf86cd799439012',
        firstName: 'John',
        lastName: 'Doe',
        designation: 'Developer',
        employeeType: 'Full-time',
      },
      date: new Date(),
    },
  ];

  beforeEach(async () => {
    mockDashboardService = {
      getStats: jest.fn(),
      getAllAttendanceForDashboard: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should call dashboardService.getStats with user_id and return dashboard stats', async () => {
      const payload: UserIdDto = { user_id: mockUserId };
      const expectedResult = {
        message: 'Dashboard fetched successfully',
        dashboard: mockDashboardStats,
      };

      mockDashboardService.getStats.mockResolvedValue(mockDashboardStats);

      const result = await controller.getDashboard(payload);

      expect(mockDashboardService.getStats).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors gracefully', async () => {
      const payload: UserIdDto = { user_id: mockUserId };

      mockDashboardService.getStats.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.getDashboard(payload)).rejects.toThrow(
        'Service error',
      );
      expect(mockDashboardService.getStats).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('getTotalAttendance', () => {
    it('should call dashboardService.getAllAttendanceForDashboard with user_id and return attendance', async () => {
      const payload: UserIdDto = { user_id: mockUserId };
      const expectedResult = {
        message: 'Attendance fetched successfully',
        attendance: mockAttendance,
      };

      mockDashboardService.getAllAttendanceForDashboard.mockResolvedValue(
        mockAttendance,
      );

      const result = await controller.getTotalAttendance(payload);

      expect(
        mockDashboardService.getAllAttendanceForDashboard,
      ).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty attendance list', async () => {
      const payload: UserIdDto = { user_id: mockUserId };
      const expectedResult = {
        message: 'Attendance fetched successfully',
        attendance: [],
      };

      mockDashboardService.getAllAttendanceForDashboard.mockResolvedValue([]);

      const result = await controller.getTotalAttendance(payload);

      expect(
        mockDashboardService.getAllAttendanceForDashboard,
      ).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors gracefully', async () => {
      const payload: UserIdDto = { user_id: mockUserId };

      mockDashboardService.getAllAttendanceForDashboard.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.getTotalAttendance(payload)).rejects.toThrow(
        'Service error',
      );
      expect(
        mockDashboardService.getAllAttendanceForDashboard,
      ).toHaveBeenCalledWith(mockUserId);
    });
  });
});
