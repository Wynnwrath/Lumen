import type { CartItem } from "../types";
import { validateCoupon as validateCouponApi } from "../api/coupons";

// asks the server to check the code; invalid codes return null
export async function checkCoupon(code: string, subtotal: number) {
  try {
    const result = await validateCouponApi(code, subtotal);
    return {
      rate: result.discountPercent / 100,
      label: `${result.discountPercent}% discount applied successfully!`,
    };
  } catch {
    return null;
  }
}

// works out all the money numbers for the cart, so cart/checkout share the same math
export function calculateOrderTotals(items: CartItem[], discountRate = 0) {
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const discountAmount = Math.round(subtotal * discountRate * 100) / 100;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const shippingFee = subtotal >= 100 || items.length === 0 ? 0 : 12.0;
  const estimatedTax = Math.round(subtotal * 0.08 * 100) / 100;
  const grandTotal = Math.round((subtotal + estimatedTax + shippingFee - discountAmount) * 100) / 100;

  return { subtotal, discountAmount, subtotalAfterDiscount, shippingFee, estimatedTax, grandTotal };
}
