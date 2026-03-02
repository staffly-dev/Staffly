import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { QuizUsersDto } from './dto/quiz-users.dto';
import { QuizSessionDto } from './dto/quiz-session.dto';
import { QuizService } from './quiz.service';

@Controller()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @MessagePattern({ cmd: 'ats.quiz.submit' })
  async submit(@Payload() body: SubmitQuizDto) {
    return this.quizService.submit(body);
  }

  @MessagePattern({ cmd: 'ats.quiz.users' })
  async getUsers(@Payload() payload: QuizUsersDto) {
    return this.quizService.getUsers(payload);
  }

  @MessagePattern({ cmd: 'ats.quiz.session.get' })
  async getBySession(@Payload() payload: QuizSessionDto) {
    return this.quizService.getBySession(payload);
  }
}
