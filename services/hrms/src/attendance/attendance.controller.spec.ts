/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/checkin.dto';

describe('AttendanceController', () => {
  let controller: AttendanceController;
  let mockAttendanceService: any;

  const mockUserId = '507f1f77bcf86cd799439011';
  const mockEmployeeId = '507f1f77bcf86cd799439012';
  const mockAttendanceId = '507f1f77bcf86cd799439013';
  const mockAttendance = {
    _id: mockAttendanceId,
    employeeId: mockEmployeeId,
    checkInTime: new Date('2023-01-01T09:00:00Z'),
    date: new Date('2023-01-01'),
    status: 'On Time',
    createdBy: mockUserId,
  };

  const mockCheckInDto: CheckInDto = {
    employeeId: mockEmployeeId,
    checkInTime: '2023-01-01T09:00:00Z',
  };

  beforeEach(async () => {
    mockAttendanceService = {
      recordCheckIn: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      search: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttendanceController],
      providers: [
        {
          provide: AttendanceService,
          useValue: mockAttendanceService,
        },
      ],
    }).compile();

    controller = module.get<AttendanceController>(AttendanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkIn', () => {
    it('should call attendanceService.recordCheckIn with employeeId, userId and checkInTime', async () => {
      const payload = {
        dto: mockCheckInDto,
        user_id: mockUserId,
      };
      const expectedResult = {
        message: 'Attendance created successfully',
        attendance: mockAttendance,
      };
      const expectedCheckInTime = new Date(mockCheckInDto.checkInTime!);

      mockAttendanceService.recordCheckIn.mockResolvedValue(mockAttendance);

      const result = await controller.checkIn(payload);

      expect(mockAttendanceService.recordCheckIn).toHaveBeenCalledWith(
        mockEmployeeId,
        mockUserId,
        expectedCheckInTime,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should call attendanceService.recordCheckIn with employeeId and userId when no checkInTime provided', async () => {
      const payload = {
        dto: { employeeId: mockEmployeeId },
        user_id: mockUserId,
      };
      const expectedResult = {
        message: 'Attendance created successfully',
        attendance: mockAttendance,
      };

      mockAttendanceService.recordCheckIn.mockResolvedValue(mockAttendance);

      const result = await controller.checkIn(payload);

      expect(mockAttendanceService.recordCheckIn).toHaveBeenCalledWith(
        mockEmployeeId,
        mockUserId,
        undefined,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors gracefully', async () => {
      const payload = {
        dto: mockCheckInDto,
        user_id: mockUserId,
      };

      mockAttendanceService.recordCheckIn.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.checkIn(payload)).rejects.toThrow(
        'Service error',
      );
      expect(mockAttendanceService.recordCheckIn).toHaveBeenCalledWith(
        mockEmployeeId,
        mockUserId,
        new Date(mockCheckInDto.checkInTime!),
      );
    });
  });

  describe('findAll', () => {
    it('should call attendanceService.findAll with user_id', async () => {
      const payload = { user_id: mockUserId };
      const mockAttendances = [mockAttendance];
      const expectedResult = {
        message: 'Attendance fetched successfully',
        attendance: mockAttendances,
      };

      mockAttendanceService.findAll.mockResolvedValue(mockAttendances);

      const result = await controller.findAll(payload);

      expect(mockAttendanceService.findAll).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty attendance list', async () => {
      const payload = { user_id: mockUserId };
      const expectedResult = {
        message: 'Attendance fetched successfully',
        attendance: [],
      };

      mockAttendanceService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(payload);

      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors gracefully', async () => {
      const payload = { user_id: mockUserId };

      mockAttendanceService.findAll.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.findAll(payload)).rejects.toThrow(
        'Service error',
      );
      expect(mockAttendanceService.findAll).toHaveBeenCalledWith(mockUserId);
    });
  });

  describe('findOne', () => {
    it('should call attendanceService.findOne with id and user_id', async () => {
      const payload = {
        id: mockAttendanceId,
        user_id: mockUserId,
      };
      const expectedResult = {
        message: 'Attendance fetched successfully',
        attendance: mockAttendance,
      };

      mockAttendanceService.findOne.mockResolvedValue(mockAttendance);

      const result = await controller.findOne(payload);

      expect(mockAttendanceService.findOne).toHaveBeenCalledWith(
        mockAttendanceId,
        mockUserId,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should handle service errors gracefully', async () => {
      const payload = {
        id: mockAttendanceId,
        user_id: mockUserId,
      };

      mockAttendanceService.findOne.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.findOne(payload)).rejects.toThrow(
        'Service error',
      );
      expect(mockAttendanceService.findOne).toHaveBeenCalledWith(
        mockAttendanceId,
        mockUserId,
      );
    });
  });

  describe('search', () => {
    it('should call attendanceService.search with user_id and name filters', async () => {
      const payload = {
        user_id: mockUserId,
        firstName: 'John',
        lastName: 'Doe',
      };
      const mockSearchResults = [mockAttendance];
      const expectedResult = {
        message: 'Attendance fetched successfully',
        attendance: mockSearchResults,
      };

      mockAttendanceService.search.mockResolvedValue(mockSearchResults);

      const result = await controller.search(payload);

      expect(mockAttendanceService.search).toHaveBeenCalledWith(
        mockUserId,
        'John',
        'Doe',
      );
      expect(result).toEqual(expectedResult);
    });

    it('should call attendanceService.search with only first name', async () => {
      const payload = {
        user_id: mockUserId,
        firstName: 'John',
      };
      const mockSearchResults = [mockAttendance];

      mockAttendanceService.search.mockResolvedValue(mockSearchResults);

      await controller.search(payload);

      expect(mockAttendanceService.search).toHaveBeenCalledWith(
        mockUserId,
        'John',
        undefined,
      );
    });

    it('should call attendanceService.search with only last name', async () => {
      const payload = {
        user_id: mockUserId,
        lastName: 'Doe',
      };
      const mockSearchResults = [mockAttendance];

      mockAttendanceService.search.mockResolvedValue(mockSearchResults);

      await controller.search(payload);

      expect(mockAttendanceService.search).toHaveBeenCalledWith(
        mockUserId,
        undefined,
        'Doe',
      );
    });

    it('should call attendanceService.search without name filters', async () => {
      const payload = { user_id: mockUserId };
      const mockSearchResults = [mockAttendance];

      mockAttendanceService.search.mockResolvedValue(mockSearchResults);

      await controller.search(payload);

      expect(mockAttendanceService.search).toHaveBeenCalledWith(
        mockUserId,
        undefined,
        undefined,
      );
    });

    it('should handle service errors gracefully', async () => {
      const payload = { user_id: mockUserId };

      mockAttendanceService.search.mockRejectedValue(
        new Error('Service error'),
      );

      await expect(controller.search(payload)).rejects.toThrow('Service error');
      expect(mockAttendanceService.search).toHaveBeenCalledWith(
        mockUserId,
        undefined,
        undefined,
      );
    });
  });
});
