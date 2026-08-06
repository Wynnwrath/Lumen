import type { CartItem } from "../types";
import axios from "axios";
import { validateCoupon as validateCouponApi } from "../api/coupons";

// the promo codes the store accepts (upper-cased before lookup)
const COUPONS: Record<string, { rate: number; label: string }> = {
  LUMEN10: { rate: 0.1, label: "10% discount applied successfully!" },
  WELCOME10: { rate: 0.1, label: "10% discount applied successfully!" },
  PRO20: { rate: 0.2, label: "20% PRO discount applied!" },
};

// returns the discount info for a code, or null if the code isn't valid
export function applyCoupon(code: string) {
  const clean = code.trim().toUpperCase();
  return COUPONS[clean] || null;
}

// asks the server to check the code, but falls back to the local demo codes when offline
export async function checkCoupon(code: string, subtotal: number) {
  try {
    const result = await validateCouponApi(code, subtotal);
    return {
      rate: result.discountPercent / 100,
      label: `${result.discountPercent}% discount applied successfully!`,
    };
  } catch (error) {
    // if the server answered, the code really is invalid; otherwise we're offline
    if (axios.isAxiosError(error) && error.response) return null;
    return applyCoupon(code);
  }
}

// works out all the money numbers for the cart, so cart/checkout share the same math
export function calculateOrderTotals(items: CartItem[], discountRate = 0) {
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const discountAmount = subtotal * discountRate;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const shippingFee = subtotalAfterDiscount > 100 || items.length === 0 ? 0 : 15.0;
  const estimatedTax = subtotalAfterDiscount * 0.08;
  const grandTotal = subtotalAfterDiscount + shippingFee + estimatedTax;

  return { subtotal, discountAmount, subtotalAfterDiscount, shippingFee, estimatedTax, grandTotal };
}
