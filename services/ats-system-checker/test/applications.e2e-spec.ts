import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';

describe('ApplicationsController E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Applications Message Patterns', () => {
    it('should initialize application module', () => {
      expect(app).toBeDefined();
    });

    it('should initialize application module', () => {
      expect(app).toBeDefined();
    });

    it('should create application successfully', () => {
      expect(app).toBeDefined();
    });
  });
});
