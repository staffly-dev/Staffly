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
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { QuizGatewayService } from './quiz.service';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { GetBySessionDto } from './dto/get-by-session.dto';
import { QuizResponseDto } from './dto/quiz-response.dto';

@ApiTags('ATS Quiz')
@Controller('api/v1/ats/quiz')
@UseGuards(JwtAuthGuard)
export class QuizGatewayController {
  constructor(private readonly quizService: QuizGatewayService) { }

  @Post('submit')
  @ApiOperation({
    summary: 'Submit quiz answers',
    description:
      'Submits quiz responses for scoring (e.g. ATS compatibility quiz). Body includes user_id, session or quiz id, and answers. user_id must match authenticated user. Returns score and feedback.',
  })
  @ApiBody({
    type: SubmitQuizDto,
    examples: {
      example1: {
        summary: 'Example quiz submission',
        value: {
          session_id: 'quiz_session_12345',
          answers: [0, 2, 1, 3, 0],
          user_id: '64f1a2b3c4d5e6f7g8h9i0j1',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Quiz submitted; score and result returned.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: user_id mismatch.',
  })
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

  @Get('get-users')
  @ApiOperation({
    summary: 'Get users for quiz context',
    description:
      'Returns users list relevant to quiz (e.g. candidates who took a quiz). Query may include user_id, pagination. user_id must match authenticated user. Use for admin/HR quiz overview.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users/quiz takers.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: user_id mismatch.',
  })
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

  @Get('get-by-session')
  @ApiOperation({
    summary: 'Get quiz by session',
    description:
      'Returns quiz data or results for a given session id. Query includes session id and optional user_id. Use to resume or display a specific quiz session. user_id must match authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'Quiz session data returned.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: user_id mismatch.',
  })
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
