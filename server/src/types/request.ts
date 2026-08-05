import type { Request } from "express";

export interface JwtPayload {
  id: string;
  role: "customer" | "admin";
}

export interface RequestWithUser extends Request {
  user?: JwtPayload;
}
