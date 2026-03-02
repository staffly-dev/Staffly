import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { QuizService } from './quiz.service';
import { QuizSession } from './schemas/quiz-session.schema';
import { QuizResult } from './schemas/quiz-result.schema';
import { JobPosting } from '../jobs/schemas/job-posting.schema';
import { Application } from '../applications/schemas/application.schema';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { QuizUsersDto } from './dto/quiz-users.dto';
import { QuizSessionDto } from './dto/quiz-session.dto';

describe('QuizService', () => {
  let service: QuizService;

  let quizSessionModel: jest.Mock & {
    find: jest.Mock;
    findById: jest.Mock;
    findByIdAndUpdate: jest.Mock;
  };

  let quizResultModel: jest.Mock & {
    findOne: jest.Mock;
  };

  let jobPostingModel: jest.Mock & {
    find: jest.Mock;
  };

  let applicationModel: jest.Mock & {
    find: jest.Mock;
    findOne: jest.Mock;
    findOneAndUpdate: jest.Mock;
  };

  const natsClient: Partial<ClientProxy> = {
    emit: jest.fn(),
  };

  const configService: Partial<ConfigService> = {
    get: jest.fn().mockReturnValue('http://localhost:3000'),
  };

  const validSessionId = '507f1f77bcf86cd799439011';

  beforeEach(async () => {
    quizSessionModel = Object.assign(jest.fn(), {
      find: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    });

    quizResultModel = Object.assign(jest.fn(), {
      findOne: jest.fn(),
    });

    jobPostingModel = Object.assign(jest.fn(), {
      find: jest.fn(),
    });

    applicationModel = Object.assign(jest.fn(), {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        { provide: ConfigService, useValue: configService },
        { provide: 'NATS_SERVICE', useValue: natsClient },
        {
          provide: getModelToken(QuizSession.name),
          useValue: quizSessionModel,
        },
        {
          provide: getModelToken(QuizResult.name),
          useValue: quizResultModel,
        },
        {
          provide: getModelToken(JobPosting.name),
          useValue: jobPostingModel,
        },
        {
          provide: getModelToken(Application.name),
          useValue: applicationModel,
        },
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('submit', () => {
    it('should throw BadRequestException when required fields are missing', async () => {
      const dto = { answers: [1, 2, 3] } as unknown as SubmitQuizDto;
      await expect(service.submit(dto)).rejects.toThrow(
        'answers, quiz_session_id, and email are required',
      );
    });

    it('should throw NotFoundException when session does not exist', async () => {
      const dto: SubmitQuizDto = {
        answers: [1, 2, 3],
        quiz_session_id: validSessionId,
        email: 'candidate@example.com',
      };

      quizSessionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.submit(dto)).rejects.toThrow(
        'Quiz session not found',
      );
    });

    it('should throw ForbiddenException when email does not match session', async () => {
      const dto: SubmitQuizDto = {
        answers: [1, 2, 3],
        quiz_session_id: validSessionId,
        email: 'other@example.com',
      };

      quizSessionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: validSessionId,
          candidate_email: 'candidate@example.com',
          questions: [{ correct_answer: 1 }],
          pass_threshold: 1,
        }),
      });

      await expect(service.submit(dto)).rejects.toThrow(
        'Email does not match quiz session',
      );
    });

    it('should calculate score and emit notification on success', async () => {
      const dto: SubmitQuizDto = {
        answers: [1, 2, 3],
        quiz_session_id: validSessionId,
        email: 'candidate@example.com',
      };

      const sessionDoc = {
        _id: validSessionId,
        candidate_email: 'candidate@example.com',
        questions: [
          { correct_answer: 1 },
          { correct_answer: 2 },
          { correct_answer: 3 },
        ],
        pass_threshold: 2,
        associated_cv_filename: 'cv.pdf',
        application_id: 'app-1',
        job_description: 'Job description',
      };

      quizSessionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(sessionDoc),
      });

      // saveQuizResult uses `new this.quizResultModel` so mock constructor
      const saveMock = jest.fn().mockResolvedValue({});
      quizResultModel.mockImplementation(() => ({ save: saveMock }));

      // updateQuizSession uses findByIdAndUpdate().exec()
      quizSessionModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      applicationModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      jobPostingModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest
            .fn()
            .mockResolvedValue([
              { title: 'Job Title', description: 'Job description' },
            ]),
        }),
      });

      applicationModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ candidate_name: 'John Doe' }),
        }),
      });

      const result = await service.submit(dto);

      expect(saveMock).toHaveBeenCalledTimes(1);
      expect(applicationModel.findOneAndUpdate).toHaveBeenCalled();
      expect(natsClient.emit as jest.Mock).toHaveBeenCalledWith(
        'notification.ats.quiz_result',
        expect.objectContaining({
          toEmail: 'candidate@example.com',
          jobTitle: 'Job Title',
        }),
      );
      expect(result.success).toBe(true);
      expect(result.data.total_questions).toBe(3);
    });
  });

  describe('getUsers', () => {
    it('should throw BadRequestException for invalid user_id format', async () => {
      const payload: QuizUsersDto = { user_id: 'invalid-id' };
      await expect(service.getUsers(payload)).rejects.toThrow(
        'Invalid user_id format',
      );
    });
  });

  describe('getBySession', () => {
    it('should throw BadRequestException when session_id is missing', async () => {
      const payload = { session_id: '' } as QuizSessionDto;
      await expect(service.getBySession(payload)).rejects.toThrow(
        'session_id is required',
      );
    });

    it('should throw NotFoundException when session not found', async () => {
      const payload: QuizSessionDto = { session_id: validSessionId };

      quizSessionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.getBySession(payload)).rejects.toThrow(
        'Quiz session not found',
      );
    });

    it('should return quiz session data without correct answers', async () => {
      const payload: QuizSessionDto = { session_id: validSessionId };

      const questions = [
        { text: 'Q1', correct_answer: 1 },
        { text: 'Q2', correct_answer: 2 },
      ];

      quizSessionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: validSessionId,
          questions,
          total_questions: questions.length,
          time_limit_seconds: 300,
          pass_threshold: 2,
          status: 'GENERATED',
          created_at: new Date(),
          started_at: undefined,
        }),
      });

      quizSessionModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      const result = await service.getBySession(payload);

      expect(result.quiz_session_id).toBe(validSessionId);
      expect(result.questions).toHaveLength(2);
      // Ensure correct_answer is stripped
      expect(result.questions[0]).toEqual({ text: 'Q1' });
    });
  });
});
