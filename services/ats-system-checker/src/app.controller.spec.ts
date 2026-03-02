import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return health check', () => {
      const result = appController.getHealth();
      expect(result).toEqual({
        status: 'Healthy!',
        service: 'ATS System Checker Service',
        version: '0.2.0',
        timestamp: expect.any(String) as unknown as string,
      });
    });
  });
});
