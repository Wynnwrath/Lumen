// Single source of truth for the order statuses. Validators derive their
// enums from these so the lists can't drift apart.
export const ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Shipped",
  "Completed",
  "Received",
  "Cancelled",
] as const;

// Statuses an admin can set. "Received" is excluded on purpose: only the
// customer (or the 3-day auto-finalize) can set it.
export const ADMIN_ORDER_STATUSES = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Shipped",
  "Completed",
  "Cancelled",
] as const;

// Statuses that count as "in progress / awaiting fulfillment" (used for the
// dashboard's pending counts, mirrors client/src/constants/index.ts).
export const PENDING_STATUSES = ["Pending", "Confirmed", "Preparing"] as const;

// Statuses that count as "delivered / finished" (used for the dashboard's
// completed counts, mirrors client/src/constants/index.ts).
export const COMPLETED_STATUSES = ["Completed", "Received"] as const;

export type OrderStatus = "Pending" | "Confirmed" | "Preparing" | "Shipped" | "Completed" | "Received" | "Cancelled";
