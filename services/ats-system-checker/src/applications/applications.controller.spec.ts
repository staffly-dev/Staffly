import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { GetAllApplicationsDto } from './dto/get-all-applications.dto';
import { GetOneApplicationDto } from './dto/get-one-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ScheduleInterviewDto } from './dto/schedule-interview.dto';
import { DeleteApplicationDto } from './dto/delete-application.dto';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let service: Record<string, jest.Mock>;

  beforeEach(async () => {
    service = {
      getAll: jest.fn(),
      getOne: jest.fn(),
      update: jest.fn(),
      scheduleInterview: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        {
          provide: ApplicationsService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate getAll to service', async () => {
    const payload = { user_id: 'user1' } as GetAllApplicationsDto;
    service.getAll.mockResolvedValue({
      total_applications: 0,
      applications: [],
    });

    const result = await controller.getAll(payload);

    expect(service.getAll).toHaveBeenCalledWith(payload);
    expect(result.total_applications).toBe(0);
  });

  it('should delegate getOne to service', async () => {
    const payload = { app_id: 'app1' } as GetOneApplicationDto;
    service.getOne.mockResolvedValue({ application_id: 'app1' });

    const result = await controller.getOne(payload);

    expect(service.getOne).toHaveBeenCalledWith(payload);
    expect(result.application_id).toBe('app1');
  });

  it('should delegate update to service', async () => {
    const payload = {
      app_id: 'app1',
      user_id: 'user1',
      updates: {},
    } as UpdateApplicationDto;
    service.update.mockResolvedValue({ success: true });

    const result = await controller.update(payload);

    expect(service.update).toHaveBeenCalledWith(payload);
    expect(result.success).toBe(true);
  });

  it('should delegate scheduleInterview to service', async () => {
    const payload = {
      app_id: 'app1',
      user_id: 'user1',
      interview_date: '2024-01-01',
      interview_time: '10:00',
    } as ScheduleInterviewDto;
    service.scheduleInterview.mockResolvedValue({ success: true });

    const result = await controller.scheduleInterview(payload);

    expect(service.scheduleInterview).toHaveBeenCalledWith(payload);
    expect(result.success).toBe(true);
  });

  it('should delegate delete to service', async () => {
    const payload = {
      app_id: 'app1',
      user_id: 'user1',
    } as DeleteApplicationDto;
    service.delete.mockResolvedValue({ success: true });

    const result = await controller.delete(payload);

    expect(service.delete).toHaveBeenCalledWith(payload);
    expect(result.success).toBe(true);
  });
});
