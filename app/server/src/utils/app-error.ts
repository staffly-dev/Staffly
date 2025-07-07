import { HTTPSTATUS, HttpStatusCodeType } from "@/config/http.config";

export class AppError extends Error {
  public statusCode: HttpStatusCodeType;
  constructor(message: string, statusCode = HTTPSTATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class InternalServerException extends AppError {
  constructor(message = "Internal Server Error") {
    super(message, HTTPSTATUS.INTERNAL_SERVER_ERROR);
  }
}

export class NotFoundException extends AppError {
  constructor(message = "Resource not found") {
    super(message, HTTPSTATUS.NOT_FOUND);
  }
}

export class BadRequestException extends AppError {
  constructor(message = "Bad Request") {
    super(message, HTTPSTATUS.BAD_REQUEST);
  }
}

export class ForbiddenException extends AppError {
  constructor(message = "Forbidden") {
    super(message, HTTPSTATUS.FORBIDDEN);
  }
}

export class UnauthorizedException extends AppError {
  constructor(message = "Unauthorized Access") {
    super(message, HTTPSTATUS.UNAUTHORIZED);
  }
}
