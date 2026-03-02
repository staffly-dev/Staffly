import { Module } from '@nestjs/common';
import { QuizGatewayController } from './quiz.controller';
import { QuizGatewayService } from './quiz.service';
import { NatsClientModule } from 'src/common/nats-client/nats-client.module';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { AuthGatewayModule } from '../../hrms/auth/auth.module';

@Module({
  imports: [NatsClientModule, AuthGatewayModule],
  controllers: [QuizGatewayController],
  providers: [QuizGatewayService, JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class QuizGatewayModule {}
