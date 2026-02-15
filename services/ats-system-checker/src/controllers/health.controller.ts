import { DatabaseService } from "../services/database.service";
import { EmailService } from "../services/email.service";
import { APIResponse } from "../models/evaluation.models";

export class HealthController {
  private database_service: DatabaseService;
  private email_service: EmailService;

  constructor(
    database_service: DatabaseService,
    email_service: EmailService
  ) {
    this.database_service = database_service;
    this.email_service = email_service;
  }

  async health_check(): Promise<APIResponse> {
    try {
      // Check database connectivity
      const db_healthy = await this.database_service.health_check();
      
      // Check email service
      let email_healthy = true;
      try {
        // Basic check - if email service has transporter configured
        email_healthy = (this.email_service as any).transporter !== null;
      } catch (error) {
        email_healthy = false;
      }
      
      // Determine overall health status
      let status: string;
      if (db_healthy) {
        if (email_healthy) {
          status = "healthy";
        } else {
          status = "degraded";
        }
      } else {
        status = "unhealthy";
      }
      
      const services_status = {
        database: db_healthy,
        email: email_healthy
      };
      
      const message = status === "healthy" 
        ? "All systems operational" 
        : "System operational with some issues";
      
      return {
        success: true,
        message,
        data: {
          status,
          services: services_status
        },
        timestamp: new Date()
      };
    } catch (error: any) {
      console.error(`Health check failed: ${error.message}`);
      return {
        success: true,
        message: `Health check failed: ${error.message}`,
        data: {
          status: "unhealthy",
          services: {
            database: false,
            email: false
          }
        },
        timestamp: new Date()
      };
    }
  }
}

