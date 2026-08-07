import { prisma } from "../lib/prisma.js";

// Opens a connection to PostgreSQL at boot; exit if it fails (no point running).
export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    console.log("PostgreSQL connected via Prisma");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
}
