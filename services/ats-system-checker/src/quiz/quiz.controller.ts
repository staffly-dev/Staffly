import {
  Controller,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DatabaseService } from '../database/database.service';
import { EvaluationService } from '../evaluation/evaluation.service';
import { EmailService } from '../email/email.service';

import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { QuizUsersDto } from './dto/quiz-users.dto';
import { QuizSessionDto } from './dto/quiz-session.dto';

@Controller()
export class QuizController {
  private frontendQuizUrl: string;

  constructor(
    private config: ConfigService,
    private db: DatabaseService,
    private evaluation: EvaluationService,
    private email: EmailService,
  ) {
    this.frontendQuizUrl = this.config.get<string>('FRONTEND_URL_QUIZ') || this.config.get<string>('FRONTEND_ORIGIN') || 'http://localhost:3000';
  }

  @MessagePattern('ats.quiz.submit')
  async submit(@Payload() body: SubmitQuizDto) {
    const { answers, quiz_session_id, email } = body;
    if (!answers || !quiz_session_id || !email) {
      throw new BadRequestException('answers, quiz_session_id, and email are required');
    }
    let answerArray: number[];
    if (Array.isArray(answers)) answerArray = answers.map((a) => Number(a));
    else if (typeof answers === 'string') {
      try {
        const parsed = JSON.parse(answers);
        answerArray = Array.isArray(parsed) ? parsed.map((a: any) => Number(a)) : [Number(answers)];
      } catch {
        throw new BadRequestException('answers must be a valid JSON array of numbers');
      }
    } else answerArray = Object.values(answers as Record<string, unknown>).map((a: any) => Number(a));

    const session = await this.db.getQuizSessionById(quiz_session_id);
    if (!session) throw new NotFoundException('Quiz session not found');
    if (session.candidate_email && session.candidate_email !== email) {
      throw new ForbiddenException('Email does not match quiz session');
    }
    const questions = session.questions as any[];
    let score = 0;
    for (let i = 0; i < questions.length && i < answerArray.length; i++) {
      if (questions[i].correct_answer === answerArray[i]) score++;
    }
    const percentage = (score / questions.length) * 100;
    const status = score >= session.pass_threshold ? 'PASSED' : 'FAILED';
    await this.db.saveQuizResult(
      quiz_session_id,
      answerArray,
      score,
      questions.length,
      percentage,
      status,
      email,
      session.associated_cv_filename,
    );
    await this.db.updateQuizSession(quiz_session_id, { status: 'COMPLETED', completed_at: new Date() });
    const applicationId = (session as any).application_id;
    if (applicationId) await this.db.updateApplication(applicationId, { quiz_score: score });

    let jobTitle = 'Job Position';
    try {
      const jobs = await this.db.getAllJobPostings();
      const match = jobs.find((j) => j.description === session.job_description);
      if (match) jobTitle = match.title;
    } catch { }
    let candidateName = 'Candidate';
    try {
      const app = await this.db.getApplicationByCandidateEmailAndCv(email, session.associated_cv_filename);
      if (app?.candidate_name) candidateName = app.candidate_name;
    } catch { }
    if (email) {
      await this.email.sendQuizResultEmail(email, candidateName, jobTitle, score, questions.length, status === 'PASSED');
    }
    return {
      success: true,
      message: `Quiz evaluation complete: ${score}/${questions.length}`,
      data: { quiz_id: quiz_session_id, score, total_questions: questions.length, percentage, passed: status === 'PASSED' },
    };
  }

  @MessagePattern('ats.quiz.users')
  async getUsers(@Payload() payload: QuizUsersDto) {
    const userId = payload?.user_id;
    if (userId && (userId.length !== 24 || !/^[0-9a-f]{24}$/i.test(userId))) {
      throw new BadRequestException('Invalid user_id format');
    }
    const sessions = await this.db.getAllQuizSessions(userId);
    const quizUsers = [];
    for (const session of sessions) {
      const result = await this.db.getQuizResultBySessionId(session._id.toString());
      quizUsers.push({
        quiz_session_id: session._id.toString(),
        candidate_email: session.candidate_email,
        quiz_link: `${this.frontendQuizUrl}/quiz/${session._id}`,
        quiz_status: session.status,
        created_at: session.created_at,
        started_at: session.started_at,
        completed_at: session.completed_at,
        score: result?.score,
        total_questions: result?.total_questions,
        percentage: result?.percentage,
        passed: result?.status === 'PASSED',
      });
    }
    return { total_quizzes: quizUsers.length, quiz_users: quizUsers };
  }

  @MessagePattern('ats.quiz.session.get')
  async getBySession(@Payload() payload: QuizSessionDto) {
    const sessionId = payload?.session_id;
    if (!sessionId?.trim()) throw new BadRequestException('session_id is required');
    const session = await this.db.getQuizSessionById(sessionId);
    if (!session) throw new NotFoundException('Quiz session not found');
    if (session.status === 'GENERATED') {
      await this.db.updateQuizSession(sessionId, { status: 'IN_PROGRESS', started_at: new Date() });
    }
    const questionsForClient = (session.questions as any[]).map((q: any) => {
      const { correct_answer: _omit, ...rest } = q;
      return rest;
    });
    return {
      quiz_session_id: sessionId,
      questions: questionsForClient,
      total_questions: session.total_questions,
      time_limit_seconds: session.time_limit_seconds,
      pass_threshold: session.pass_threshold,
      status: session.status,
      created_at: session.created_at,
      started_at: session.started_at,
    };
  }
}
