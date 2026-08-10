import type { Request, Response, NextFunction, RequestHandler } from "express";

// Express doesn't catch errors thrown in async handlers on its own,
// so wrap them and push the error to the error handler instead.
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
}
