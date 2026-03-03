import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../auth/decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { Role } from '../../auth/enums/role.enum';

export enum Permission {
  // User management
  CREATE_USER = 'create:user',
  READ_USER = 'read:user',
  UPDATE_USER = 'update:user',
  DELETE_USER = 'delete:user',

  // Employee management
  CREATE_EMPLOYEE = 'create:employee',
  READ_EMPLOYEE = 'read:employee',
  UPDATE_EMPLOYEE = 'update:employee',
  DELETE_EMPLOYEE = 'delete:employee',
  READ_EMPLOYEE_SALARY = 'read:employee:salary',

  // Attendance management
  CREATE_ATTENDANCE = 'create:attendance',
  READ_ATTENDANCE = 'read:attendance',
  UPDATE_ATTENDANCE = 'update:attendance',

  // Billing management
  CREATE_BILLING = 'create:billing',
  READ_BILLING = 'read:billing',
  UPDATE_BILLING = 'update:billing',
  DELETE_BILLING = 'delete:billing',

  // System administration
  SYSTEM_ADMIN = 'system:admin',
  VIEW_AUDIT_LOGS = 'view:audit_logs',

  // Job management (ATS)
  CREATE_JOB = 'create:job',
  READ_JOB = 'read:job',
  UPDATE_JOB = 'update:job',
  DELETE_JOB = 'delete:job',

  // Application management (ATS)
  CREATE_APPLICATION = 'create:application',
  READ_APPLICATION = 'read:application',
  UPDATE_APPLICATION = 'update:application',
  DELETE_APPLICATION = 'delete:application',
  SCHEDULE_INTERVIEW = 'schedule:interview',
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: Object.values(Permission),
  [Role.HR_USER]: [
    Permission.READ_USER,
    Permission.CREATE_EMPLOYEE,
    Permission.READ_EMPLOYEE,
    Permission.UPDATE_EMPLOYEE,
    Permission.READ_EMPLOYEE_SALARY,
    Permission.CREATE_ATTENDANCE,
    Permission.READ_ATTENDANCE,
    Permission.UPDATE_ATTENDANCE,
    Permission.CREATE_BILLING,
    Permission.READ_BILLING,
    Permission.UPDATE_BILLING,
    Permission.DELETE_BILLING,
    Permission.CREATE_JOB,
    Permission.READ_JOB,
    Permission.UPDATE_JOB,
    Permission.DELETE_JOB,
    Permission.CREATE_APPLICATION,
    Permission.READ_APPLICATION,
    Permission.UPDATE_APPLICATION,
    Permission.DELETE_APPLICATION,
    Permission.SCHEDULE_INTERVIEW,
  ],
  [Role.EMPLOYEE]: [
    Permission.READ_EMPLOYEE,
    Permission.CREATE_ATTENDANCE,
    Permission.READ_ATTENDANCE,
    Permission.READ_BILLING,
    Permission.READ_JOB,
    Permission.CREATE_APPLICATION,
    Permission.READ_APPLICATION,
  ],
  [Role.PENDING]: [],
};

@Injectable()
export class RbacGuard implements CanActivate {
  private readonly logger = new Logger(RbacGuard.name);

  constructor(private readonly reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles && !requiredPermissions) {
      return true; // No restrictions
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const userRole = user.role as Role;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    // Check role-based access
    if (requiredRoles && !requiredRoles.includes(userRole)) {
      this.logger.warn(`Access denied - insufficient role`, {
        userId: user.userId,
        userRole,
        requiredRoles,
        path: request.path,
        method: request.method,
        ip: request.ip,
        timestamp: new Date().toISOString(),
      });

      throw new ForbiddenException('Insufficient role permissions');
    }

    // Check permission-based access
    if (requiredPermissions) {
      const hasAllPermissions = requiredPermissions.every((permission) =>
        userPermissions.includes(permission),
      );

      if (!hasAllPermissions) {
        this.logger.warn(`Access denied - insufficient permissions`, {
          userId: user.userId,
          userRole,
          userPermissions,
          requiredPermissions,
          path: request.path,
          method: request.method,
          ip: request.ip,
          timestamp: new Date().toISOString(),
        });

        throw new ForbiddenException('Insufficient permissions');
      }
    }

    this.logger.log(`Access granted`, {
      userId: user.userId,
      userRole,
      path: request.path,
      method: request.method,
      ip: request.ip,
      timestamp: new Date().toISOString(),
    });

    return true;
  }
}
