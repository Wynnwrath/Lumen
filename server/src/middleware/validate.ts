import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/AppError.js";

type ValidatedRequest = Request & {
  validatedQuery: unknown;
};

export function validate<S extends ZodType>(schema: S, source: "body" | "query" = "body") {
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
      (req as ValidatedRequest).validatedQuery = result.data;
    }
    next();
  };
}
