import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError.js";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code, details: err.details },
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        res.status(409).json({
          success: false,
          error: { message: "A record with that value already exists", code: "DUPLICATE" },
        });
        return;
      case "P2025":
        res.status(404).json({
          success: false,
          error: { message: "Record not found", code: "NOT_FOUND" },
        });
        return;
      case "P2003":
        res.status(409).json({
          success: false,
          error: { message: "Operation failed due to a related record constraint", code: "CONFLICT" },
        });
        return;
      case "P2023":
        res.status(400).json({
          success: false,
          error: { message: "Invalid ID format", code: "INVALID_ID" },
        });
        return;
    }
  }

  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: { message: "Internal server error", code: "INTERNAL_ERROR" },
  });
}
