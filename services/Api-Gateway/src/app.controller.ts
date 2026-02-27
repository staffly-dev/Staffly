import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Controller, Get } from '@nestjs/common';

@ApiTags('Health')
@Controller('api/v1')
export class AppController {
  constructor(@Inject('NATS_SERVICE') private natsClient: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'Get gateway status' })
  @ApiResponse({ status: 200, description: 'Gateway is running' })
  getHealth(): object {
    return {
      status: 'Healthy!',
      service: 'API Gateway Service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  // Backend Services
  @Get('hrms/health')
  getHrmsHealth() {
    return this.natsClient.send({ cmd: 'getHrmsHealth' }, {});
  }

  @Get('ats-checker/health')
  getAtsCheckerHealth() {
    return this.natsClient.send({ cmd: 'getAtsCheckerHealth' }, {});
  }
}
