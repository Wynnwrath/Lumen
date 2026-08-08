import type { OrderStatus } from "../types";

// ─── Pricing rules ─────────────────────────────────────────────────────────
// Keep in sync with the server (server/src/modules/orders/order.service.ts).
export const FREE_SHIPPING_MIN = 100;   // orders >= this ship free
export const SHIPPING_FEE = 12;         // flat shipping fee below the threshold
export const TAX_RATE = 0.08;           // 8% estimated sales tax

// ─── Stock thresholds ──────────────────────────────────────────────────────
// Storefront "Only X left" urgency badge (ProductCard / ProductDetailPage).
export const STORE_LOW_STOCK_THRESHOLD = 3;
// Admin "needs restocking" alert + filters (dashboard / products page).
export const ADMIN_LOW_STOCK_THRESHOLD = 5;

// The full allowed order lifecycle states (matches the server enum).
export const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Shipped",
  "Completed",
  "Received",
  "Cancelled",
];

// Statuses an admin can select. "Received" is excluded: only the customer
// (or the 3-day auto-finalize) can set it.
export const ADMIN_ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Shipped",
  "Completed",
  "Cancelled",
];

// Statuses that count as "in progress / awaiting fulfillment" (used for
// "pending" counts and filters across the dashboard + orders pages).
export const PENDING_STATUSES: OrderStatus[] = ["Pending", "Confirmed", "Preparing"];

export const isPendingStatus = (status: string): boolean =>
  PENDING_STATUSES.includes(status as OrderStatus);

// Statuses that count as "delivered / finished" for the completed KPI.
export const COMPLETED_STATUSES: OrderStatus[] = ["Completed", "Received"];

export const isCompletedStatus = (status: string): boolean =>
  COMPLETED_STATUSES.includes(status as OrderStatus);

// Neutral placeholder used whenever a product has no image (or the image
// fails to load). An inline SVG so there's no external network dependency.
export const FALLBACK_PRODUCT_IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><rect width='400' height='400' fill='%23e2e8f0'/><g fill='none' stroke='%2394a3b8' stroke-width='18' stroke-linecap='round' stroke-linejoin='round'><rect x='140' y='115' width='120' height='95' rx='12'/><circle cx='187' cy='152' r='14'/><path d='M140 208 L188 172 L233 197 L253 180 L274 197'/></g></svg>";
