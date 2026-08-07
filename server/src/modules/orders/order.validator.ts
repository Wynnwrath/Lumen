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
  couponCode: z.string().optional(),
  orderNotes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["Pending", "Confirmed", "Preparing", "Shipped", "Completed", "Cancelled"]),
});

export const orderQuerySchema = z.object({
  status: z.enum(["Pending", "Confirmed", "Preparing", "Shipped", "Completed", "Cancelled"]).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderQuery = z.infer<typeof orderQuerySchema>;
