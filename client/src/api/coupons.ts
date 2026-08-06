import api from "./client";

export interface CouponValidation {
  code: string;
  discountPercent: number;
  discountAmount: number;
}

export async function validateCoupon(code: string, subtotal: number) {
  const res = await api.post<{ success: true; data: CouponValidation }>("/coupons/validate", { code, subtotal });
  return res.data.data;
}
