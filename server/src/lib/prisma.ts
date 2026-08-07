import { PrismaClient } from "@prisma/client";

// Single shared PrismaClient instance (avoids duplicate DB connections on hot reload).
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
