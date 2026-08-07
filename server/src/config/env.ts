import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const isProduction = process.env.NODE_ENV === "production";

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] || fallback;
  if (isProduction && !process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  if (!isProduction && name === "JWT_SECRET" && !process.env[name]) {
    console.warn("WARNING: JWT_SECRET not set — using insecure dev fallback.");
  }
  return value as string;
}

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  databaseUrl: requireEnv("DATABASE_URL", "postgresql://localhost:5432/lumen"),
  jwtSecret: requireEnv("JWT_SECRET", "fallback-secret"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  resendApiKey: process.env.RESEND_API_KEY || "",
} as const;
