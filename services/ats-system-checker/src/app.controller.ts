import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  @MessagePattern({ cmd: 'getAppHealth' })
  getHealth(): object {
    return {
      status: 'Healthy!',
      service: 'ATS System Checker Service',
      version: '0.2.0',
      timestamp: new Date().toISOString(),
    };
  }
}
