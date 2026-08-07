import { z } from "zod";

// Body for POST /coupons/validate.
export const validateCouponSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0),
});
