import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface AuditLogData {
  userId?: string;
  userRole?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
  method: string;
  path: string;
  statusCode?: number;
  success: boolean;
  timestamp: Date;
  details?: any;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    // Extract audit information
    const auditData: Partial<AuditLogData> = {
      userId: request.user?.userId,
      userRole: request.user?.role,
      method: request.method,
      path: request.path,
      ip: request.ip,
      userAgent: request.get('User-Agent'),
      timestamp: new Date(),
    };

    // Determine action and resource based on endpoint
    const { action, resource, resourceId } = this.extractActionInfo(request);
    auditData.action = action;
    auditData.resource = resource;
    auditData.resourceId = resourceId;

    return next.handle().pipe(
      tap({
        next: (response) => {
          const duration = Date.now() - startTime;
          const logEntry: AuditLogData = {
            ...auditData,
            statusCode: context.switchToHttp().getResponse().statusCode,
            success: true,
            details: { duration, responseSize: JSON.stringify(response).length },
          } as AuditLogData;

          this.logAuditEvent(logEntry);
        },
        error: (error) => {
          const logEntry: AuditLogData = {
            ...auditData,
            statusCode: error.status || 500,
            success: false,
            details: { error: error.message, stack: error.stack },
          } as AuditLogData;

          this.logAuditEvent(logEntry);
        },
      }),
    );
  }

  private extractActionInfo(request: any): {
    action: string;
    resource: string;
    resourceId?: string;
  } {
    const { method, path, body, params, query } = request;

    // Extract resource type from path
    const pathParts = path.split('/').filter(Boolean);
    const resource = pathParts[0] || 'unknown';
    const resourceId = params.id || query.id;

    // Map HTTP methods to actions
    const actionMap = {
      GET: resourceId ? 'read' : 'list',
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
    };

    const action = actionMap[method] || 'unknown';

    return { action, resource, resourceId };
  }

  private logAuditEvent(logEntry: AuditLogData): void {
    // Skip logging for health checks and non-sensitive endpoints
    if (this.shouldSkipLogging(logEntry.path)) {
      return;
    }

    const logLevel = this.determineLogLevel(logEntry);
    const logMessage = this.formatLogMessage(logEntry);

    switch (logLevel) {
      case 'error':
        this.logger.error(logMessage, logEntry);
        break;
      case 'warn':
        this.logger.warn(logMessage, logEntry);
        break;
      default:
        this.logger.log(logMessage, logEntry);
    }

    // In production, you might want to send this to a dedicated audit service
    // or store it in a secure audit database
    if (process.env.NODE_ENV === 'production') {
      this.sendToAuditService(logEntry);
    }
  }

  private shouldSkipLogging(path: string): boolean {
    const skipPaths = [
      '/health',
      '/metrics',
      '/favicon.ico',
      '/robots.txt',
      '/static/',
    ];
    return skipPaths.some((skipPath) => path.includes(skipPath));
  }

  private determineLogLevel(logEntry: AuditLogData): 'log' | 'warn' | 'error' {
    if (!logEntry.success) return 'error';
    if (logEntry.action === 'delete' || logEntry.action === 'create') return 'warn';
    return 'log';
  }

  private formatLogMessage(logEntry: AuditLogData): string {
    const { action, resource, userId, success } = logEntry;
    const status = success ? 'SUCCESS' : 'FAILURE';
    return `AUDIT: ${status} - ${action.toUpperCase()} ${resource} by user ${userId || 'anonymous'}`;
  }

  private sendToAuditService(logEntry: AuditLogData): void {
    // Implementation for sending audit logs to external service
    // This could be Elasticsearch, Splunk, or a dedicated audit database
    // For now, we'll just log it (already done above)
    // In a real implementation, you might use a message queue or direct API call
    
    // Example: this.auditService.create(logEntry);
    // Ensure this is async and doesn't block the main request flow
  }
}
