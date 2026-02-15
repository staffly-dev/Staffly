import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import net from "net";
import { Env } from "./config/env.config";
import { connectDatabase, disconnectDatabase } from "./config/database.config";
import { DatabaseService } from "./services/database.service";
import { EmailService } from "./services/email.service";
import { EvaluationService } from "./services/evaluation.service";
import { S3Service } from "./services/s3.service";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { requestLoggingMiddleware } from "./middlewares/logging.middleware";
import { enhancedSecurityMiddleware, docsAuthenticationMiddleware } from "./middlewares/security.middleware";
import { swaggerUi, getSwaggerSpec } from "./swagger";
import healthRoutes from "./routes/health.routes";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: Env.CORS_ALLOW_ORIGINS ? Env.CORS_ALLOW_ORIGINS.split(",").map(o => o.trim()) :
    Env.FRONTEND_ORIGIN ? [Env.FRONTEND_ORIGIN] : ["http://localhost:3000"],
  credentials: Env.CORS_ALLOW_CREDENTIALS,
  methods: Env.CORS_METHODS.split(","),
  allowedHeaders: Env.CORS_ALLOWED_HEADERS.split(",")
};
app.use(cors(corsOptions));

// Security middleware
if (Env.DOCS_AUTH_ENABLED) {
  app.use(docsAuthenticationMiddleware);
}
app.use(enhancedSecurityMiddleware);

// Logging middleware
app.use(requestLoggingMiddleware);

// Create necessary directories
const uploadFolder = path.join(process.cwd(), Env.UPLOAD_FOLDER);
const evaluationsFolder = path.join(process.cwd(), Env.EVALUATIONS_FOLDER);
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}
if (!fs.existsSync(evaluationsFolder)) {
  fs.mkdirSync(evaluationsFolder, { recursive: true });
}

// Static file serving
app.use("/uploads", express.static(uploadFolder));
app.use("/evaluations", express.static(evaluationsFolder));

// Swagger API Documentation
// The docsAuthenticationMiddleware is already applied above, so it will protect /docs
const swaggerSpec = getSwaggerSpec();
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/openapi.json", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Initialize services (will be set in app.locals)
let databaseService: DatabaseService;
let emailService: EmailService;
let evaluationService: EvaluationService;
let s3Service: S3Service;

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "ATS System Backend",
    version: "2.0.0",
    description: "Modern Express/TypeScript backend for ATS (Applicant Tracking System)",
    environment: Env.ENV,
    status: "running",
    docs: Env.DOCS_AUTH_ENABLED ? "/docs" : "disabled",
    available_endpoints: {
      health: "/ats-checker/health/simple",
      jobs: "/ats-checker/jobs",
      statistics: "/ats-checker/statistics",
      applications: "/ats-checker/applications",
      s3_upload: "/ats-checker/s3/upload",
      documentation: Env.DOCS_AUTH_ENABLED ? "/docs" : "disabled"
    },
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/ats-checker", healthRoutes);

// Import and use other routes
import jobsRoutes from "./routes/jobs.routes";
import quizRoutes from "./routes/quiz.routes";
import statisticsRoutes from "./routes/statistics.routes";
import applicationsRoutes from "./routes/applications.routes";
import awsS3Routes from "./routes/aws_s3.routes";

app.use("/ats-checker", jobsRoutes);
app.use("/ats-checker", quizRoutes);
app.use("/ats-checker", statisticsRoutes);
app.use("/ats-checker", applicationsRoutes);
app.use("/ats-checker", awsS3Routes);

// Error handler (must be last)
app.use(errorHandler);

// Catch-all route
app.get("/ats-checker/:path(*)", (req: Request, res: Response) => {
  res.status(404).json({
    error: "Endpoint not found",
    message: `The path '/${req.params.path}' does not exist`,
    available_endpoints: {
      root: "/",
      health: "/ats-checker/health/simple",
      api: "/ats-checker"
    }
  });
});

// Initialize services and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Initialize services
    databaseService = new DatabaseService(Env.MONGODB_URL, Env.MONGODB_DATABASE);
    await databaseService.connect();

    emailService = new EmailService(
      Env.GMAIL_USER,
      Env.GMAIL_PASSWORD,
      databaseService,
      Env.BACKEND_URL
    );

    evaluationService = new EvaluationService(
      Env.AI_SERVICE_URL,
      emailService,
      databaseService
    );

    s3Service = new S3Service();

    // Store services in app.locals for access in routes
    app.locals.databaseService = databaseService;
    app.locals.emailService = emailService;
    app.locals.evaluationService = evaluationService;
    app.locals.s3Service = s3Service;

    // Check if a port is available
    const isPortAvailable = (port: number): Promise<boolean> => {
      return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(port, () => {
          server.once('close', () => resolve(true));
          server.close();
        });
        server.on('error', () => resolve(false));
      });
    };

    // Find an available port
    const findAvailablePort = async (startPort: number, maxAttempts: number = 10): Promise<number> => {
      for (let i = 0; i < maxAttempts; i++) {
        const port = startPort + i;
        const available = await isPortAvailable(port);
        if (available) {
          if (i > 0) {
            console.warn(`⚠ Port ${startPort} was in use. Using port ${port} instead.`);
          }
          return port;
        }
      }
      throw new Error(`Could not find an available port after ${maxAttempts} attempts starting from ${startPort}`);
    };

    // Start server on available port
    const defaultPort = Env.PORT || Env.API_PORT || 4002;
    const port = await findAvailablePort(defaultPort);

    const server = app.listen(port, () => {
      console.log("=".repeat(60));
      console.log("ATS System Backend Started Successfully");
      console.log(`Environment: ${Env.ENV.toUpperCase()}`);
      console.log(`API Host: ${Env.API_HOST}:${port}`);
      console.log(`Backend URL: ${Env.BACKEND_URL}`);
      if (Env.AI_SERVICE_URL) {
        console.log(`AI Service URL: ${Env.AI_SERVICE_URL}`);
      }
      console.log(`📚 API Documentation: ${Env.get_backend_url().replace(/:\d+$/, `:${port}`)}/docs`);
      console.log("=".repeat(60));
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      console.error('Server error:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to initialize application:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  if (databaseService) {
    await databaseService.disconnect();
  }
  await disconnectDatabase();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  if (databaseService) {
    await databaseService.disconnect();
  }
  await disconnectDatabase();
  process.exit(0);
});

// Start the server
startServer();

export default app;

