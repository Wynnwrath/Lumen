import { z } from "zod";

// Body for POST /coupons/validate.
export const validateCouponSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0),
});

// Admin create/update payloads. Codes are normalized to uppercase in the service.
export const createCouponSchema = z.object({
  code: z.string().min(1, "Code is required").max(30),
  discountPercent: z.number().min(1, "Discount must be at least 1%").max(90, "Discount max is 90%"),
  isActive: z.boolean().optional(),
});

export const updateCouponSchema = z.object({
  code: z.string().min(1).max(30).optional(),
  discountPercent: z.number().min(1).max(90).optional(),
  isActive: z.boolean().optional(),
});
