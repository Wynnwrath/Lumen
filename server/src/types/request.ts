import type { Request } from "express";

// What goes inside the JWT when a user logs in.
export interface JwtPayload {
  id: string;
  role: "customer" | "admin";
}

// A request that may have a logged-in user attached (set by `protect`).
export interface RequestWithUser extends Request {
  user?: JwtPayload;
}
