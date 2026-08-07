// Re-export Prisma's generated Product type under the old IProduct name
// so existing imports keep working.
export type { Product as IProduct } from "@prisma/client";
