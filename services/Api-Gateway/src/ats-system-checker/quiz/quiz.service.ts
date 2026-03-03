import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { GetBySessionDto } from './dto/get-by-session.dto';
import { QuizResponseDto } from './dto/quiz-response.dto';

@Injectable()
export class QuizGatewayService {
  constructor(
    @Inject('NATS_SERVICE')
    private readonly client: ClientProxy,
  ) { }

  submit(payload: SubmitQuizDto): Observable<QuizResponseDto> {
    return this.client.send({ cmd: 'ats.quiz.submit' }, payload);
  }

  getUsers(query: GetUsersDto): Observable<QuizResponseDto> {
    return this.client.send({ cmd: 'ats.quiz.users' }, query);
  }

  getBySession(query: GetBySessionDto): Observable<QuizResponseDto> {
    return this.client.send({ cmd: 'ats.quiz.session.get' }, query);
  }
}
