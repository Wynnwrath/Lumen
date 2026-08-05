import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code, details: err.details },
    });
    return;
  }

  if (err.name === "ValidationError") {
    res.status(400).json({
      success: false,
      error: { message: "Validation failed", code: "VALIDATION_ERROR", details: err.message },
    });
    return;
  }

  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      error: { message: "Invalid ID format", code: "CAST_ERROR" },
    });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: { message: "Internal server error", code: "INTERNAL_ERROR" },
  });
}
