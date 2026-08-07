import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../utils/AppError.js";

// Validates body (or query) against a Zod schema before the handler runs.
// Bad input -> 400 with the field errors instead of crashing downstream.
export function validate(schema: ZodSchema, source: "body" | "query" = "body"): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const data = source === "body" ? req.body : req.query;
    const result = schema.safeParse(data);
    if (!result.success) {
      const details = result.error.flatten().fieldErrors;
      return next(new AppError("Validation failed", 400, "VALIDATION_ERROR", details));
    }
    next();
  };
}
