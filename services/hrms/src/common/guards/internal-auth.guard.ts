import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class InternalAuthGuard implements CanActivate {
  private readonly logger = new Logger(InternalAuthGuard.name);
  private readonly internalSecret: string;

  constructor(private readonly configService: ConfigService) {
    const secret = this.configService.get<string>('INTERNAL_SERVICE_SECRET');
    if (!secret) {
      throw new Error('INTERNAL_SERVICE_SECRET is required for internal authentication');
    }
    this.internalSecret = secret;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['x-internal-auth'];

    if (!authHeader) {
      this.logger.warn('Missing internal authentication header', {
        ip: request.ip,
        path: request.path,
        userAgent: request.get('User-Agent'),
        timestamp: new Date().toISOString(),
      });

      throw new UnauthorizedException('Internal authentication required');
    }

    if (authHeader !== this.internalSecret) {
      this.logger.error('Invalid internal authentication token', {
        ip: request.ip,
        path: request.path,
        userAgent: request.get('User-Agent'),
        timestamp: new Date().toISOString(),
      });

      throw new UnauthorizedException('Invalid internal authentication');
    }

    // Add internal service flag to request
    request.isInternalService = true;

    this.logger.log('Internal service authenticated successfully', {
      ip: request.ip,
      path: request.path,
      timestamp: new Date().toISOString(),
    });

    return true;
  }
}
