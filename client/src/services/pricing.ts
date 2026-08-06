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
  const discountAmount = subtotal * discountRate;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const shippingFee = subtotalAfterDiscount > 100 || items.length === 0 ? 0 : 15.0;
  const estimatedTax = subtotalAfterDiscount * 0.08;
  const grandTotal = subtotalAfterDiscount + shippingFee + estimatedTax;

  return { subtotal, discountAmount, subtotalAfterDiscount, shippingFee, estimatedTax, grandTotal };
}
