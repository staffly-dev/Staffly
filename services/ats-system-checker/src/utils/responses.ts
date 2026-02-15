import { Response } from "express";
import { APIResponse } from "../models/evaluation.models";

export function success_response(
  message: string = "Success",
  data: any = null,
  status_code: number = 200
): APIResponse {
  return {
    success: true,
    message,
    data,
    timestamp: new Date()
  };
}

export function error_response(
  res: Response,
  message: string = "An error occurred",
  details?: string,
  status_code: number = 500
): Response {
  const content: any = {
    success: false,
    message,
    error: true
  };
  
  if (details) {
    content.details = details;
  }
  
  return res.status(status_code).json(content);
}

export function validation_error_response(
  res: Response,
  message: string = "Validation failed",
  errors: Record<string, any> = {}
): Response {
  return res.status(422).json({
    success: false,
    message,
    error: true,
    validation_errors: errors
  });
}

export function not_found_response(
  res: Response,
  resource: string = "Resource"
): Response {
  return res.status(404).json({
    success: false,
    message: `${resource} not found`,
    error: true
  });
}

