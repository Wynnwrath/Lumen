import type { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError.js";

// Everything thrown while handling a request lands here -> turned into JSON.
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  // Our own errors already have a status + message.
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code, details: err.details },
    });
    return;
  }

  // Give common Prisma errors a clean HTTP response instead of a raw 500.
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        // Duplicate value on a unique column (e.g. email already taken).
        res.status(409).json({
          success: false,
          error: { message: "A record with that value already exists", code: "DUPLICATE" },
        });
        return;
      case "P2025":
        // Tried to update/delete a row that doesn't exist.
        res.status(404).json({
          success: false,
          error: { message: "Record not found", code: "NOT_FOUND" },
        });
        return;
      case "P2003":
        // Foreign key points at a record that doesn't exist.
        res.status(409).json({
          success: false,
          error: { message: "Operation failed due to a related record constraint", code: "CONFLICT" },
        });
        return;
      case "P2023":
        // Badly-formed id passed to the DB.
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
