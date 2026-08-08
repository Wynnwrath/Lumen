import { z } from "zod";

const orderItemSchema = z.object({
  // `product` is the product's id (matches what the client sends).
  product: z.string().min(1),
  quantity: z.number().int().min(1),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "Cart must have at least one item"),
  address: z.string().min(1, "Delivery address is required"),
  paymentMethod: z.enum(["Cash on Delivery", "E-Wallet", "Bank Transfer"]),
  email: z.string().email("Valid email required").optional(),
  couponCode: z.string().optional(),
  orderNotes: z.string().optional(),
});

// Admins select the 6 statuses they control; "Received" is customer-driven.
export const updateOrderStatusSchema = z.object({
  status: z.enum(["Pending", "Confirmed", "Preparing", "Shipped", "Completed", "Cancelled"]),
});

export const orderQuerySchema = z.object({
  status: z.enum(["Pending", "Confirmed", "Preparing", "Shipped", "Completed", "Received", "Cancelled"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderQuery = z.infer<typeof orderQuerySchema>;
