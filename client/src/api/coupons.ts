import api from "./client";
import type { ApiResponse } from "../types";

// What the server returns when a coupon code is accepted.
export interface CouponValidation {
  code: string;
  discountPercent: number;
  discountAmount: number;
}

// Admin-managed coupon record.
export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CouponPayload {
  code: string;
  discountPercent: number;
  isActive?: boolean;
}

export async function validateCoupon(code: string, subtotal: number) {
  const res = await api.post<ApiResponse<CouponValidation>>("/coupons/validate", { code, subtotal });
  return res.data.data;
}

export async function getCoupons() {
  const res = await api.get<ApiResponse<Coupon[]>>("/coupons");
  return res.data.data;
}

export async function createCoupon(data: CouponPayload) {
  const res = await api.post<ApiResponse<Coupon>>("/coupons", data);
  return res.data.data;
}

export async function updateCoupon(code: string, data: Partial<CouponPayload>) {
  const res = await api.patch<ApiResponse<Coupon>>(`/coupons/${code}`, data);
  return res.data.data;
}

export async function deleteCoupon(code: string) {
  await api.delete<ApiResponse<null>>(`/coupons/${code}`);
}
