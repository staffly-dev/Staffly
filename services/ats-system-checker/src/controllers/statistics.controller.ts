import { DatabaseService } from "../services/database.service";
import { StatisticsResponse, UserStatisticsResponse } from "../models/api.models";

export class StatisticsController {
  private database_service: DatabaseService;

  constructor(database_service: DatabaseService) {
    this.database_service = database_service;
  }

  async get_statistics(): Promise<StatisticsResponse> {
    try {
      console.log("Retrieving system statistics");
      
      // Get evaluation statistics
      const eval_stats = await this.database_service.get_evaluation_statistics();
      
      // Get quiz statistics
      const quiz_stats = await this.database_service.get_quiz_statistics();
      
      // Combine statistics
      return {
        total_applications: eval_stats.total_evaluations || 0,
        total_evaluations: eval_stats.total_evaluations || 0,
        acceptance_rate: eval_stats.acceptance_rate || 0.0,
        average_score: eval_stats.average_score || 0.0,
        quiz_pass_rate: quiz_stats.pass_rate,
        daily_stats: {}
      };
    } catch (error: any) {
      console.error(`Error retrieving statistics: ${error.message}`);
      return {
        total_applications: 0,
        total_evaluations: 0,
        acceptance_rate: 0.0,
        average_score: 0.0,
        quiz_pass_rate: 0.0,
        daily_stats: {}
      };
    }
  }

  async get_user_statistics(user_id: string, created_by: string): Promise<UserStatisticsResponse> {
    try {
      console.log(`Retrieving user statistics for user_id: ${user_id}, created_by: ${created_by}`);
      
      // Get user's applications count
      const user_applications = await this.database_service.get_all_applications(user_id);
      const total_applications = user_applications.length;
      
      // Get user's evaluation statistics
      const eval_stats = await this.database_service.get_user_evaluation_statistics(user_id);
      
      // Get user's quiz statistics
      const quiz_stats = await this.database_service.get_user_quiz_statistics(user_id);
      
      return {
        user_id,
        created_by,
        total_applications,
        total_evaluations: eval_stats.total_evaluations || 0,
        acceptance_rate: eval_stats.acceptance_rate || 0.0,
        average_score: eval_stats.average_score || 0.0,
        quiz_pass_rate: quiz_stats.pass_rate || 0.0,
        daily_stats: {},
        last_activity: undefined
      };
    } catch (error: any) {
      console.error(`Error retrieving user statistics: ${error.message}`);
      return {
        user_id,
        created_by,
        total_applications: 0,
        total_evaluations: 0,
        acceptance_rate: 0.0,
        average_score: 0.0,
        quiz_pass_rate: 0.0,
        daily_stats: {},
        last_activity: undefined
      };
    }
  }
}

