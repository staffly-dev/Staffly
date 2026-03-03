import { ForbiddenException, Logger } from '@nestjs/common';

export class IdorProtectionUtil {
  private static readonly logger = new Logger(IdorProtectionUtil.name);

  static validateResourceAccess(
    userId: string,
    resourceUserId: string,
    userRole: string,
    action: 'read' | 'update' | 'delete' = 'read',
  ): void {
    // Admin can access all resources
    if (userRole === 'ADMIN') {
      return;
    }

    // HR users can read all employee data but can only update/delete their own
    if (userRole === 'HR_USER') {
      if (action === 'read') {
        return; // HR users can read all employee data
      }
      // For update/delete, they can only modify their own data
      if (userId !== resourceUserId) {
        this.logIdorAttempt(userId, resourceUserId, userRole, action);
        throw new ForbiddenException('Access denied: Cannot modify other users data');
      }
      return;
    }

    // Regular employees can only access their own data
    if (userId !== resourceUserId) {
      this.logIdorAttempt(userId, resourceUserId, userRole, action);
      throw new ForbiddenException('Access denied: Insufficient permissions');
    }
  }

  static validateSalaryAccess(
    userId: string,
    resourceUserId: string,
    userRole: string,
  ): void {
    // Only admins and HR users can access salary information
    if (userRole !== 'ADMIN' && userRole !== 'HR_USER') {
      this.logIdorAttempt(userId, resourceUserId, userRole, 'read_salary');
      throw new ForbiddenException('Access denied: Cannot access salary information');
    }

    // HR users can read all salaries, admins can do everything
    if (userRole === 'HR_USER') {
      return;
    }
  }

  static validateBillingAccess(
    userId: string,
    resourceUserId: string,
    userRole: string,
    action: 'read' | 'update' | 'delete' = 'read',
  ): void {
    // Admin can access all billing data
    if (userRole === 'ADMIN') {
      return;
    }

    // HR users can read billing but only update/delete their own
    if (userRole === 'HR_USER') {
      if (action === 'read') {
        return;
      }
      if (userId !== resourceUserId) {
        this.logIdorAttempt(userId, resourceUserId, userRole, `billing_${action}`);
        throw new ForbiddenException('Access denied: Cannot modify other users billing data');
      }
      return;
    }

    // Regular employees can only read their own billing data
    if (action !== 'read' || userId !== resourceUserId) {
      this.logIdorAttempt(userId, resourceUserId, userRole, `billing_${action}`);
      throw new ForbiddenException('Access denied: Cannot access billing information');
    }
  }

  static validateApplicationAccess(
    userId: string,
    applicationUserId: string,
    userRole: string,
    action: 'read' | 'update' | 'delete' = 'read',
  ): void {
    // Admin can access all applications
    if (userRole === 'ADMIN') {
      return;
    }

    // HR users can access all applications
    if (userRole === 'HR_USER') {
      return;
    }

    // Regular employees can only access their own applications
    if (userId !== applicationUserId) {
      this.logIdorAttempt(userId, applicationUserId, userRole, `application_${action}`);
      throw new ForbiddenException('Access denied: Cannot access other users applications');
    }
  }

  static validateJobAccess(
    userId: string,
    jobPostedBy: string,
    userRole: string,
    action: 'read' | 'update' | 'delete' = 'read',
  ): void {
    // Admin can access all jobs
    if (userRole === 'ADMIN') {
      return;
    }

    // HR users can access all jobs
    if (userRole === 'HR_USER') {
      return;
    }

    // Regular employees can only read jobs
    if (action !== 'read') {
      this.logIdorAttempt(userId, jobPostedBy, userRole, `job_${action}`);
      throw new ForbiddenException('Access denied: Cannot modify job postings');
    }
  }

  private static logIdorAttempt(
    userId: string,
    targetUserId: string,
    userRole: string,
    action: string,
  ): void {
    this.logger.warn(`IDOR attempt detected`, {
      userId,
      targetUserId,
      userRole,
      action,
      timestamp: new Date().toISOString(),
    });
  }

  static sanitizeQueryParams(
    userId: string,
    userRole: string,
    queryParams: any,
  ): any {
    const sanitized = { ...queryParams };

    // Remove sensitive parameters that could lead to IDOR
    if (userRole !== 'ADMIN' && userRole !== 'HR_USER') {
      delete sanitized.userId;
      delete sanitized.includeSensitive;
      delete sanitized.includeSalary;
    }

    // Add user filter for regular users to prevent data enumeration
    if (userRole === 'EMPLOYEE') {
      sanitized.userId = userId;
    }

    return sanitized;
  }
}
