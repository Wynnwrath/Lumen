// Money saved by a percentage coupon. Percent is a whole number (10 = 10%).
export function calcDiscount(subtotal: number, discountPercent: number): number {
  return Math.round(subtotal * discountPercent) / 100;
}
