/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { QuizUsersDto } from './dto/quiz-users.dto';
import { QuizSessionDto } from './dto/quiz-session.dto';

describe('QuizController', () => {
  let controller: QuizController;
  let quizService: Record<string, jest.Mock>;

  beforeEach(async () => {
    quizService = {
      submit: jest.fn(),
      getUsers: jest.fn(),
      getBySession: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [
        {
          provide: QuizService,
          useValue: quizService,
        },
      ],
    }).compile();

    controller = module.get<QuizController>(QuizController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('submit', () => {
    it('should delegate to quizService.submit', async () => {
      const dto: SubmitQuizDto = {
        answers: [1, 2, 3],
        quiz_session_id: '507f1f77bcf86cd799439011',
        email: 'candidate@example.com',
      };
      const expected = { success: true } as any;
      quizService.submit.mockResolvedValue(expected);

      const result = await controller.submit(dto);

      expect(quizService.submit).toHaveBeenCalledWith(dto);
      expect(result).toBe(expected);
    });
  });

  describe('getUsers', () => {
    it('should delegate to quizService.getUsers', async () => {
      const payload: QuizUsersDto = { user_id: '507f1f77bcf86cd799439011' };
      const expected = { total_quizzes: 0, quiz_users: [] } as any;
      quizService.getUsers.mockResolvedValue(expected);

      const result = await controller.getUsers(payload);

      expect(quizService.getUsers).toHaveBeenCalledWith(payload);
      expect(result).toBe(expected);
    });
  });

  describe('getBySession', () => {
    it('should delegate to quizService.getBySession', async () => {
      const payload: QuizSessionDto = {
        session_id: '507f1f77bcf86cd799439012',
      };
      const expected = { quiz_session_id: payload.session_id } as any;
      quizService.getBySession.mockResolvedValue(expected);

      const result = await controller.getBySession(payload);

      expect(quizService.getBySession).toHaveBeenCalledWith(payload);
      expect(result).toBe(expected);
    });
  });
});
