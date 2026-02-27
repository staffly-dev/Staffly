import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

const OBJECT_ID_REGEX = /^[0-9a-f]{24}$/i;

@Injectable()
export class UserIdGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const xUserId = req.headers['x-user-id'] as string;
    const bodyUserId = (req.body as any)?.user_id;
    const queryUserId = (req.query as any)?.user_id;
    const effective = bodyUserId || queryUserId || xUserId;
    if (!effective) {
      throw new BadRequestException({
        success: false,
        error: true,
        message: 'X-User-Id header is required',
      });
    }
    if (effective.length !== 24 || !OBJECT_ID_REGEX.test(effective)) {
      throw new BadRequestException({
        success: false,
        error: true,
        message: 'Invalid user_id format',
      });
    }
    const xCreatedBy = req.headers['x-created-by'] as string;
    if (xCreatedBy && xCreatedBy !== effective) {
      throw new ForbiddenException({
        success: false,
        error: true,
        message: 'created_by must match user_id',
      });
    }
    (req as any).effectiveUserId = effective;
    return true;
  }
}
