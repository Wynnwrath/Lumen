// Re-export Prisma's generated Order/OrderItem types, plus the allowed statuses.
export type { Order, OrderItem } from "@prisma/client";
export type OrderStatus = "Pending" | "Confirmed" | "Preparing" | "Shipped" | "Completed" | "Received" | "Cancelled";
