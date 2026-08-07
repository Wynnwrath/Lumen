import { AppError } from "./AppError.js";
import type { JwtPayload } from "../types/request.js";
import type { Request } from "express";

export function requireUser(req: Request): JwtPayload {
  const user = (req as Request & { user?: JwtPayload }).user;
  if (!user) throw new AppError("Not authenticated", 401, "UNAUTHORIZED");
  return user;
}
