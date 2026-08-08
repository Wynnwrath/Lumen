import dotenv from "dotenv";
import path from "node:path";

// Loads .env from the project root so env vars are available.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Central place to read env vars instead of touching process.env everywhere.
export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  jwtSecret: process.env.JWT_SECRET || "fallback-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  resendApiKey: process.env.RESEND_API_KEY || "",
};
