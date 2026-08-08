import { z } from "zod";
import { ORDER_STATUSES, ADMIN_ORDER_STATUSES } from "./order.model.js";
import { PHONE_PATTERN } from "../../utils/validation.js";

const orderItemSchema = z.object({
  // `product` is the product's id (matches what the client sends).
  product: z.string().min(1),
  quantity: z.number().int().min(1),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Cart must have at least one item"),
  address: z.string().min(5, "Delivery address is too short"),
  paymentMethod: z.enum(["Cash on Delivery", "E-Wallet", "Bank Transfer"]),
  email: z.string().email("Valid email required").optional(),
  phone: z.string().regex(PHONE_PATTERN, "Invalid phone number").optional(),
  couponCode: z.string().optional(),
  orderNotes: z.string().optional(),
});

// Admins select the admin statuses they control; "Received" is customer-driven.
export const updateOrderStatusSchema = z.object({
  status: z.enum(ADMIN_ORDER_STATUSES),
});

export const orderQuerySchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderQuery = z.infer<typeof orderQuerySchema>;
