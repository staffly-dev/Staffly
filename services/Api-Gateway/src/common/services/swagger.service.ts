/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable, INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import expressBasicAuth from 'express-basic-auth';
import { LoggerService } from './logger.service';

@Injectable()
export class SwaggerService {
  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {}

  createSwaggerDocument(app: INestApplication) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Staffly API Gateway')
      .setDescription(
        'API Gateway for Staffly microservices platform. ' +
          'This gateway provides a single entry point for all microservices, handling authentication, ' +
          'routing, and request proxying. The platform includes authentication, HRMS services, ATS Checker service',
      )
      .setVersion('0.2.0')
      .setContact(
        'Staffly Company',
        'https://stafflyhr.tech',
        'stafflycompany@gmail.com',
      )
      .setLicense('CC-BY-4.0', 'https://creativecommons.org/licenses/by/4.0/');

    // Server URLs from .env; first added is the default for "Execute" in Swagger UI
    const publicOrigin = this.configService.get<string>('API_GATEWAY_ORIGIN');
    const localUrl =
      this.configService.get<string>('SWAGGER_SERVER_LOCAL') ||
      `http://localhost:${this.configService.get('PORT')}`;
    const productionUrl = this.configService.get<string>(
      'SWAGGER_SERVER_PRODUCTION',
    );

    if (publicOrigin) {
      swaggerConfig.addServer(
        publicOrigin,
        'Current Server (Railway / Deployed)',
      );
    }
    swaggerConfig.addServer(localUrl, 'Local Development Server');
    if (productionUrl) {
      swaggerConfig.addServer(productionUrl, 'Production');
    }
    swaggerConfig
      .addTag('Health', 'Health check endpoints for gateway and microservices (HRMS, ATS).')
      .addTag('HRMS Auth', 'Registration, login, logout, password reset, OAuth (Google), and current user.')
      .addTag('HRMS Account', 'User account profile: get and update.')
      .addTag('HRMS Attendance', 'Check-in/check-out and attendance records.')
      .addTag('HRMS Billing', 'Billing and subscription info for the account.')
      .addTag('HRMS Dashboard', 'Dashboard summary and attendance stats.')
      .addTag('HRMS Employees', 'Employee CRUD for the organization.')
      .addTag('HRMS Payroll', 'Payroll records: create, list, search, update, delete.')
      .addTag('HRMS Settings', 'User settings and preferences.')
      .addTag('ATS Jobs', 'Job postings: list, create, get one, update, delete, and apply.')
      .addTag('ATS Applications', 'Job applications: list, get one, update, schedule interview, delete.')
      .addTag('ATS Quiz', 'ATS quiz: submit answers, get users, get by session.')
      .addTag('ATS Statistics', 'ATS analytics: global, quiz, jobs, applications, user stats.')
      // Cookie-based authentication (primary method)
      .addApiKey(
        {
          type: 'apiKey',
          in: 'cookie',
          name: 'accessToken',
          description:
            'JWT access token stored in HTTP-only cookie. Set automatically after login.',
        },
        'cookie',
      )
      // Bearer token authentication (alternative)
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'JWT access token (alternative to cookie-based auth). Use Authorization: Bearer <token> header.',
        },
        'bearer',
      );

    // Add basic auth for production Swagger UI protection
    if (
      this.configService.get('NODE_ENV') === 'production' &&
      this.configService.get('SWAGGER_USER') &&
      this.configService.get('SWAGGER_PASSWORD')
    ) {
      swaggerConfig.addBasicAuth(
        {
          type: 'http',
          scheme: 'basic',
          description: 'Basic authentication for Swagger UI access',
        },
        'basic',
      );
    }

    return swaggerConfig.build();
  }

  setupSwagger(app: INestApplication) {
    const config = this.createSwaggerDocument(app);
    const document = SwaggerModule.createDocument(app, config);

    // Swagger UI options
    const swaggerOptions: any = {
      customSiteTitle: 'Staffly API Gateway Documentation',
      customCss: '.swagger-ui .topbar { display: none }',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        docExpansion: 'list',
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
      },
    };

    // Add basic auth middleware for production
    if (
      this.configService.get('NODE_ENV') === 'production' &&
      this.configService.get('SWAGGER_USER') &&
      this.configService.get('SWAGGER_PASSWORD')
    ) {
      app.use(
        '/api-docs',
        expressBasicAuth({
          users: {
            [this.configService.get('SWAGGER_USER') as string]:
              this.configService.get('SWAGGER_PASSWORD') as string,
          },
          challenge: true,
          realm: 'Vonova API Gateway',
        }),
      );
    }

    SwaggerModule.setup('api-docs', app, document, swaggerOptions);

    this.loggerService.log(
      `📚 Swagger docs available at http://localhost:${this.configService.get('PORT')}/api-docs`,
    );
    if (
      this.configService.get('NODE_ENV') === 'production' &&
      this.configService.get('SWAGGER_USER') &&
      this.configService.get('SWAGGER_PASSWORD')
    ) {
      this.loggerService.log(
        `🔐 Swagger UI protected with basic authentication`,
      );
    }
  }
}
