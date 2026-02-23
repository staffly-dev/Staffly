import { ErrorRequestHandler, Response } from "express";
import { Error } from "mongoose";
import { z, ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (
  error,
  req,
  res,
  next
): void => {
  console.error(`Error occurred on PATH: ${req.path}`, error);

  if (error instanceof ZodError) {
    formatZodError(res, error);
    return;
  }

  if (error instanceof Error.CastError) {
    res.status(400).json({
      message: "Invalid data type",
      error: `Invalid value '${error.value}' for field '${error.path}'`,
    });
    return;
  }

  if (error instanceof Error.ValidationError) {
    res.status(400).json({
      message: "Validation failed",
      error: error.message,
    });
    return;
  }

  res.status(500).json({
    message: "Internal Server Error",
    error: error instanceof Error ? error.message : "Unknown error occurred",
  });
};

const formatZodError = (res: Response, error: z.ZodError) => {
  const errors = error?.issues?.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
  return res.status(400).json({
    message: "Validation failed",
    errors: errors,
  });
};

