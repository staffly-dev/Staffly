import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Controller, Get } from '@nestjs/common';
import { firstValueFrom, timeout } from 'rxjs';
import { ServiceUnavailableException } from '@nestjs/common';

@ApiTags('Health')
@Controller('api/v1')
export class AppController {
  constructor(@Inject('NATS_SERVICE') private natsClient: ClientProxy) {}

  @Get()
  @ApiOperation({
    summary: 'Get gateway status',
    description:
      'Checks that the API Gateway is running. Returns service name, version, and timestamp. Use this for uptime checks or to confirm the gateway is the entry point for all API requests.',
  })
  @ApiResponse({
    status: 200,
    description: 'Gateway is running and ready to proxy requests.',
  })
  getHealth(): object {
    return {
      status: 'Healthy!',
      service: 'API Gateway Service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('hrms/health')
  @ApiOperation({
    summary: 'HRMS service health',
    description:
      'Returns the health status of the HRMS microservice. Use this to verify the HRMS backend is reachable and responsive. Response includes status and service metadata. Returns 503 if HRMS is not running or not connected to NATS.',
  })
  @ApiResponse({
    status: 200,
    description: 'HRMS service is healthy and responding.',
  })
  @ApiResponse({
    status: 503,
    description:
      'HRMS service unavailable (not running or not connected to NATS).',
  })
  async getHrmsHealth(): Promise<object> {
    try {
      return (await firstValueFrom(
        this.natsClient.send({ cmd: 'getHrmsHealth' }, {}).pipe(timeout(5000)),
      )) as object;
    } catch {
      throw new ServiceUnavailableException({
        status: 'unavailable',
        service: 'hrms',
        message:
          'HRMS service is not available. Ensure the HRMS microservice is running and connected to the same NATS server.',
      });
    }
  }

  @Get('ats-checker/health')
  @ApiOperation({
    summary: 'ATS Checker service health',
    description:
      'Returns the health status of the ATS (Applicant Tracking System) Checker microservice. Use this to verify the ATS backend is reachable and responsive. Returns 503 if ATS is not running or not connected to NATS.',
  })
  @ApiResponse({
    status: 200,
    description: 'ATS Checker service is healthy and responding.',
  })
  @ApiResponse({
    status: 503,
    description:
      'ATS Checker service unavailable (not running or not connected to NATS).',
  })
  async getAtsCheckerHealth(): Promise<object> {
    try {
      return (await firstValueFrom(
        this.natsClient
          .send({ cmd: 'getAtsCheckerHealth' }, {})
          .pipe(timeout(5000)),
      )) as object;
    } catch {
      throw new ServiceUnavailableException({
        status: 'unavailable',
        service: 'ats-checker',
        message:
          'ATS Checker service is not available. Ensure the ATS microservice is running and connected to the same NATS server.',
      });
    }
  }
}
