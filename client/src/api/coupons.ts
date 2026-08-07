import api from "./client";
import type { ApiResponse } from "../types";

export interface CouponValidation {
  code: string;
  discountPercent: number;
  discountAmount: number;
}

export async function validateCoupon(code: string, subtotal: number) {
  const res = await api.post<ApiResponse<CouponValidation>>("/coupons/validate", { code, subtotal });
  return res.data.data;
}
