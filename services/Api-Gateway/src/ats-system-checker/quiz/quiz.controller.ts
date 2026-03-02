/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { QuizGatewayService } from './quiz.service';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { GetBySessionDto } from './dto/get-by-session.dto';
import { QuizResponseDto } from './dto/quiz-response.dto';

@Controller('api/v1/ats/quiz')
@UseGuards(JwtAuthGuard)
export class QuizGatewayController {
  constructor(private readonly quizService: QuizGatewayService) {}

  @Post('submit')
  async submit(
    @Body() payload: SubmitQuizDto,
    @Request() req: any,
  ): Promise<QuizResponseDto> {
    // Example: ensure user_id matches authenticated user; adjust as needed
    if (payload.user_id && payload.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.quizService.submit(payload));
  }

  @Get('users')
  async getUsers(
    @Query() query: GetUsersDto,
    @Request() req: any,
  ): Promise<QuizResponseDto> {
    // Example: ensure user_id matches authenticated user; adjust as needed
    if (query.user_id && query.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.quizService.getUsers(query));
  }

  @Get('session')
  async getBySession(
    @Query() query: GetBySessionDto,
    @Request() req: any,
  ): Promise<QuizResponseDto> {
    // Example: ensure user_id matches authenticated user; adjust as needed
    if (query.user_id && query.user_id !== req.user._id) {
      throw new ForbiddenException('Access denied: user_id mismatch');
    }
    return firstValueFrom(this.quizService.getBySession(query));
  }
}
