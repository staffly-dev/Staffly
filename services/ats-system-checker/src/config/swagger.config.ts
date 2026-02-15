import path from "path";
import { Env } from "./env.config";

export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ATS System Checker API',
      version: '2.0.0',
      description: 'ATS (Applicant Tracking System) API documentation with Swagger',
      contact: {
        name: 'Staffly Team',
      },
    },
    servers: [
      {
        url: Env.is_development
          ? `http://localhost:${Env.PORT}`
          : Env.get_backend_url(),
        description: Env.is_development ? 'Development server' : 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token obtained from authentication endpoint',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Jobs',
        description: 'Job management endpoints',
      },
      {
        name: 'Applications',
        description: 'Job application endpoints',
      },
      {
        name: 'Quiz',
        description: 'Quiz and assessment endpoints',
      },
      {
        name: 'Statistics',
        description: 'Statistics and analytics endpoints',
      },
      {
        name: 'AWS S3',
        description: 'AWS S3 file upload endpoints',
      },
    ],
  },
  apis: [
    './src/docs/**/*.ts',
    './dist/docs/**/*.js', // For compiled JavaScript files
  ],
};

