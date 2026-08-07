import { config } from "../config/env.js";
import jwt, { type SignOptions } from "jsonwebtoken";

// Signs a JWT for a logged-in user (id + role). `protect` verifies it later.
export function signToken(id: string, role: "customer" | "admin"): string {
  return jwt.sign({ id, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
  });
}
