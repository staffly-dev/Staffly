import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler";
import { Env } from "../config/env.config";
import {
  CVEvaluation,
  QuizSession,
  QuizResult,
  JobPosting,
  Application,
  SystemMetrics,
  EmailNotification
} from "../models/database.models";

const router = Router();

// Database connection and status info
router.get(
  "/debug/db",
  asyncHandler(async (req: Request, res: Response) => {
    const db = mongoose.connection.db;

    if (!db) {
      return res.status(503).json({
        error: "Database not connected",
        message: "MongoDB connection is not established"
      });
    }

    try {
      // Get database stats
      const adminDb = db.admin();
      const serverStatus = await adminDb.serverStatus();
      const dbStats = await db.stats();

      // Get collection names
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map((col: { name: string }) => col.name);

      // Get collection counts
      const collectionCounts: Record<string, number> = {};
      for (const collectionName of collectionNames) {
        try {
          const count = await db.collection(collectionName).countDocuments();
          collectionCounts[collectionName] = count;
        } catch (error) {
          collectionCounts[collectionName] = -1; // Error getting count
        }
      }

      return res.status(200).json({
        success: true,
        database: {
          name: db.databaseName,
          status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          port: mongoose.connection.port
        },
        collections: {
          names: collectionNames,
          counts: collectionCounts,
          total: collectionNames.length
        },
        stats: {
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize,
          indexes: dbStats.indexes,
          indexSize: dbStats.indexSize,
          collections: dbStats.collections
        },
        server: {
          version: serverStatus.version,
          uptime: serverStatus.uptime,
          connections: serverStatus.connections
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Failed to retrieve database info",
        message: error.message
      });
    }
  })
);

// Sample data from various collections
router.get(
  "/debug/sample-data",
  asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5;

    try {
      const [cvEvaluations, quizSessions, quizResults, jobPostings, applications, systemMetrics, emailNotifications] = await Promise.all([
        CVEvaluation.find().limit(limit).lean().exec(),
        QuizSession.find().limit(limit).lean().exec(),
        QuizResult.find().limit(limit).lean().exec(),
        JobPosting.find().limit(limit).lean().exec(),
        Application.find().limit(limit).lean().exec(),
        SystemMetrics.find().limit(limit).lean().exec(),
        EmailNotification.find().limit(limit).lean().exec()
      ]);

      // Get total counts
      const [cvCount, quizSessionCount, quizResultCount, jobCount, appCount, metricsCount, emailCount] = await Promise.all([
        CVEvaluation.countDocuments().exec(),
        QuizSession.countDocuments().exec(),
        QuizResult.countDocuments().exec(),
        JobPosting.countDocuments().exec(),
        Application.countDocuments().exec(),
        SystemMetrics.countDocuments().exec(),
        EmailNotification.countDocuments().exec()
      ]);

      return res.status(200).json({
        success: true,
        sample_size: limit,
        data: {
          cv_evaluations: {
            total: cvCount,
            samples: cvEvaluations
          },
          quiz_sessions: {
            total: quizSessionCount,
            samples: quizSessions
          },
          quiz_results: {
            total: quizResultCount,
            samples: quizResults
          },
          job_postings: {
            total: jobCount,
            samples: jobPostings
          },
          applications: {
            total: appCount,
            samples: applications
          },
          system_metrics: {
            total: metricsCount,
            samples: systemMetrics
          },
          email_notifications: {
            total: emailCount,
            samples: emailNotifications
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Failed to retrieve sample data",
        message: error.message
      });
    }
  })
);

// Test AI service connection
router.get(
  "/debug/ai-connection",
  asyncHandler(async (req: Request, res: Response) => {
    let aiHealthy = false;
    let aiPingTime = 0;
    let aiError: string | null = null;
    let aiServiceInfo: any = null;
    let testResults: any = {};

    if (!Env.AI_SERVICE_URL || !Env.AI_SERVICE_ENABLED) {
      return res.status(200).json({
        success: false,
        message: "AI service is disabled or not configured",
        ai_service: {
          enabled: Env.AI_SERVICE_ENABLED,
          url: Env.AI_SERVICE_URL || "not configured",
          healthy: false,
          error: "AI service is disabled or not configured"
        }
      });
    }

    // Test 1: Health check
    try {
      const startTime = Date.now();
      const healthResponse = await axios.get(`${Env.AI_SERVICE_URL}/health`, {
        timeout: 10000
      });
      aiPingTime = Date.now() - startTime;

      if (healthResponse.status === 200 && healthResponse.data) {
        aiHealthy = healthResponse.data.status === "healthy" || healthResponse.data.status === "degraded";
        aiServiceInfo = {
          status: healthResponse.data.status,
          service: healthResponse.data.service,
          version: healthResponse.data.version,
          environment: healthResponse.data.environment,
          ai_service: healthResponse.data.ai_service,
          cohere_configured: healthResponse.data.ai_service?.cohere_configured || false
        };
        testResults.health_check = {
          success: true,
          response_time_ms: aiPingTime,
          data: healthResponse.data
        };
      }
    } catch (error: any) {
      aiHealthy = false;
      aiError = error.message || "Connection failed";
      if (error.code === "ECONNREFUSED") {
        aiError = "Connection refused - AI service may be down";
      } else if (error.code === "ETIMEDOUT") {
        aiError = "Connection timeout - AI service may be slow or unreachable";
      }
      testResults.health_check = {
        success: false,
        error: aiError,
        code: error.code
      };
    }

    // Test 2: Test evaluate-cv endpoint (if health check passed)
    if (aiHealthy) {
      try {
        const testStartTime = Date.now();
        const testResponse = await axios.post(
          `${Env.AI_SERVICE_URL}/evaluate-cv`,
          {
            cv_text: "Test CV content with Python, JavaScript, and React experience.",
            job_description: "Software Engineer position requiring Python and JavaScript skills.",
            required_skills: ["Python", "JavaScript", "React"]
          },
          { timeout: 30000 }
        );
        const testTime = Date.now() - testStartTime;

        testResults.evaluate_cv_test = {
          success: true,
          response_time_ms: testTime,
          has_decision: !!testResponse.data.decision,
          has_score: typeof testResponse.data.score === "number",
          score: testResponse.data.score,
          decision: testResponse.data.decision
        };
      } catch (error: any) {
        testResults.evaluate_cv_test = {
          success: false,
          error: error.message || "Test failed",
          code: error.code
        };
      }
    }

    // Test 3: Test generate-quiz endpoint (if health check passed)
    if (aiHealthy) {
      try {
        const testStartTime = Date.now();
        const testResponse = await axios.post(
          `${Env.AI_SERVICE_URL}/generate-quiz`,
          {
            job_description: "Software Engineer position requiring Python and JavaScript skills.",
            num_questions: 5
          },
          { timeout: 30000 }
        );
        const testTime = Date.now() - testStartTime;

        testResults.generate_quiz_test = {
          success: true,
          response_time_ms: testTime,
          questions_count: testResponse.data.questions?.length || 0,
          has_questions: Array.isArray(testResponse.data.questions) && testResponse.data.questions.length > 0
        };
      } catch (error: any) {
        testResults.generate_quiz_test = {
          success: false,
          error: error.message || "Test failed",
          code: error.code
        };
      }
    }

    return res.status(aiHealthy ? 200 : 503).json({
      success: aiHealthy,
      message: aiHealthy ? "AI service connection is working" : "AI service connection failed",
      ai_service: {
        enabled: Env.AI_SERVICE_ENABLED,
        url: Env.AI_SERVICE_URL,
        healthy: aiHealthy,
        ping_time_ms: aiPingTime,
        error: aiError,
        info: aiServiceInfo
      },
      test_results: testResults,
      timestamp: new Date().toISOString()
    });
  })
);

// Health check with database and AI service status
router.get(
  "/health/test",
  asyncHandler(async (req: Request, res: Response) => {
    const db = mongoose.connection.db;
    let dbHealthy = false;
    let dbPingTime = 0;

    if (db) {
      try {
        const startTime = Date.now();
        await db.admin().ping();
        dbPingTime = Date.now() - startTime;
        dbHealthy = true;
      } catch (error) {
        dbHealthy = false;
      }
    }

    // Check AI service connection
    let aiHealthy = false;
    let aiPingTime = 0;
    let aiError: string | null = null;
    let aiServiceInfo: any = null;

    if (Env.AI_SERVICE_URL && Env.AI_SERVICE_ENABLED) {
      try {
        const startTime = Date.now();
        const response = await axios.get(`${Env.AI_SERVICE_URL}/health`, {
          timeout: 5000
        });
        aiPingTime = Date.now() - startTime;

        if (response.status === 200 && response.data) {
          aiHealthy = response.data.status === "healthy" || response.data.status === "degraded";
          aiServiceInfo = {
            status: response.data.status,
            service: response.data.service,
            version: response.data.version,
            environment: response.data.environment,
            ai_service: response.data.ai_service,
            cohere_configured: response.data.ai_service?.cohere_configured || false
          };
        }
      } catch (error: any) {
        aiHealthy = false;
        aiError = error.message || "Connection failed";
        if (error.code === "ECONNREFUSED") {
          aiError = "Connection refused - AI service may be down";
        } else if (error.code === "ETIMEDOUT") {
          aiError = "Connection timeout - AI service may be slow or unreachable";
        }
      }
    } else {
      aiError = "AI service is disabled or not configured";
    }

    // Determine overall health status
    const overallStatus = dbHealthy && (aiHealthy || !Env.AI_SERVICE_ENABLED) ? "healthy" : "degraded";

    return res.status(200).json({
      status: overallStatus,
      message: "ATS System is operational",
      version: "2.0.0",
      checks: {
        server: "operational",
        database: {
          connected: mongoose.connection.readyState === 1,
          healthy: dbHealthy,
          ping_time_ms: dbPingTime,
          state: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
        },
        ai_service: {
          enabled: Env.AI_SERVICE_ENABLED,
          url: Env.AI_SERVICE_URL || "not configured",
          healthy: aiHealthy,
          ping_time_ms: aiPingTime,
          error: aiError,
          info: aiServiceInfo
        }
      },
      timestamp: new Date().toISOString()
    });
  })
);

export default router;

