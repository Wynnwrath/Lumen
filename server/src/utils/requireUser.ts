import { AppError } from "./AppError.js";
import type { JwtPayload } from "../types/request.js";
import type { Request } from "express";

// Grabs the user that `protect` attached to the request, or throws 401.
export function requireUser(req: Request): JwtPayload {
  const user = (req as Request & { user?: JwtPayload }).user;
  if (!user) throw new AppError("Not authenticated", 401, "UNAUTHORIZED");
  return user;
}
