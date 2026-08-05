import type { Request, Response, NextFunction, RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { AppError } from "../utils/AppError.js";

export function validate(schema: ZodSchema, source: "body" | "query" = "body"): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const data = source === "body" ? req.body : req.query;
    const result = schema.safeParse(data);
    if (!result.success) {
      const details = result.error.flatten().fieldErrors;
      return next(new AppError("Validation failed", 400, "VALIDATION_ERROR", details));
    }
    if (source === "body") {
      req.body = result.data;
    } else {
      (req as Request & { query: typeof result.data }).query = result.data as Record<string, string>;
    }
    next();
  };
}
