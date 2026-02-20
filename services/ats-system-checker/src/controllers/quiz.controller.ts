import { Request, Response } from "express";
import { DatabaseService } from "../services/database.service";
import { EvaluationService } from "../services/evaluation.service";
import { AllQuizUsersResponse, QuizUserInfoResponse, QuizDisplayResponse } from "../models/api.models";
import { Env } from "../config/env.config";

export class QuizController {
  private database_service: DatabaseService;
  private evaluation_service: EvaluationService;

  constructor(
    database_service: DatabaseService,
    evaluation_service: EvaluationService
  ) {
    this.database_service = database_service;
    this.evaluation_service = evaluation_service;
  }

  async evaluate_quiz(req: Request, res: Response): Promise<Response> {
    try {
      const { answers, quiz_session_id, email } = req.body;
      
      console.log(`Processing quiz evaluation request for quiz session: ${quiz_session_id}`);
      
      if (!answers || !quiz_session_id || !email) {
        return res.status(400).json({
          success: false,
          error: true,
          message: "answers, quiz_session_id, and email are required"
        });
      }
      
      // Get quiz session
      const quiz_session = await this.database_service.get_quiz_session_by_id(quiz_session_id);
      if (!quiz_session) {
        return res.status(404).json({
          success: false,
          error: true,
          message: "Quiz session not found"
        });
      }
      
      // Validate email matches
      if (quiz_session.candidate_email && quiz_session.candidate_email !== email) {
        return res.status(403).json({
          success: false,
          error: true,
          message: "Email does not match quiz session"
        });
      }
      
      // Evaluate answers
      const questions = quiz_session.questions as any[];
      const answerArray = Array.isArray(answers) ? answers : Object.values(answers);
      
      let score = 0;
      for (let i = 0; i < questions.length && i < answerArray.length; i++) {
        if (questions[i].correct_answer === answerArray[i]) {
          score++;
        }
      }
      
      const percentage = (score / questions.length) * 100;
      const status = score >= quiz_session.pass_threshold ? "PASSED" : "FAILED";
      
      // Save quiz result
      await this.database_service.save_quiz_result(
        quiz_session_id,
        answerArray,
        score,
        questions.length,
        percentage,
        status,
        email,
        quiz_session.associated_cv_filename
      );
      
      // Update quiz session
      await this.database_service.update_quiz_session(quiz_session_id, {
        status: "COMPLETED",
        completed_at: new Date()
      });
      
      return res.status(200).json({
        success: true,
        message: `Quiz evaluation complete: ${score}/${questions.length}`,
        data: {
          quiz_id: quiz_session_id,
          score,
          total_questions: questions.length,
          percentage,
          passed: status === "PASSED"
        }
      });
    } catch (error: any) {
      console.error(`Error evaluating quiz: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: true,
        message: `Failed to evaluate quiz: ${error.message}`
      });
    }
  }

  async get_all_quiz_users(req: Request, res: Response): Promise<Response> {
    try {
      console.log("Retrieving all quiz users information");
      
      const x_user_id = req.headers["x-user-id"] as string;
      // Support user_id from body (POST) or query params (GET)
      const effective_user_id = req.body?.user_id || req.query?.user_id as string || x_user_id;
      
      // Get all quiz sessions filtered by user_id
      const quiz_sessions = await this.database_service.get_all_quiz_sessions(effective_user_id);
      
      const quiz_users: QuizUserInfoResponse[] = [];
      for (const session of quiz_sessions) {
        const quiz_link = `${Env.BACKEND_URL}/quiz/${session._id}`;
        const result = await this.database_service.get_quiz_result_by_session_id(session._id.toString());
        
        quiz_users.push({
          quiz_session_id: session._id.toString(),
          candidate_email: session.candidate_email,
          quiz_link,
          quiz_status: session.status,
          created_at: session.created_at,
          started_at: session.started_at,
          completed_at: session.completed_at,
          score: result?.score,
          total_questions: result?.total_questions,
          percentage: result?.percentage,
          passed: result?.status === "PASSED"
        });
      }
      
      const response: AllQuizUsersResponse = {
        total_quizzes: quiz_users.length,
        quiz_users
      };
      
      return res.status(200).json(response);
    } catch (error: any) {
      console.error(`Error retrieving quiz users: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: true,
        message: `Failed to retrieve quiz users: ${error.message}`
      });
    }
  }

  async get_quiz_by_session_id(req: Request, res: Response): Promise<Response> {
    try {
      const session_id = Array.isArray(req.params.session_id) ? req.params.session_id[0] : req.params.session_id;
      console.log(`Getting quiz for session: ${session_id}`);
      
      const quiz_session = await this.database_service.get_quiz_session_by_id(session_id);
      if (!quiz_session) {
        return res.status(404).json({
          success: false,
          error: true,
          message: "Quiz session not found"
        });
      }
      
      // Update status to IN_PROGRESS if it's GENERATED
      if (quiz_session.status === "GENERATED") {
        await this.database_service.update_quiz_session(session_id, {
          status: "IN_PROGRESS",
          started_at: new Date()
        });
      }
      
      const response: QuizDisplayResponse = {
        quiz_session_id: session_id as string,
        questions: quiz_session.questions,
        total_questions: quiz_session.total_questions,
        time_limit_seconds: quiz_session.time_limit_seconds,
        pass_threshold: quiz_session.pass_threshold,
        status: quiz_session.status,
        created_at: quiz_session.created_at,
        started_at: quiz_session.started_at
      };
      
      return res.status(200).json(response);
    } catch (error: any) {
      console.error(`Error getting quiz: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: true,
        message: `Failed to get quiz: ${error.message}`
      });
    }
  }
}

