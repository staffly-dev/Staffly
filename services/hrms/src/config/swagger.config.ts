export const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Staffly API',
      version: '1.0.0',
      description: 'Staffly HRMS API documentation with Swagger',
    },
    servers: [
      {
        url: 'http://localhost:4001/api', // Change if needed
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/docs/app/*.ts',
    './src/docs/auth/*.ts',
    './src/docs/attendance/*.ts',
    './src/docs/employees/*.ts',
  ], // Include your route/docs folder
};