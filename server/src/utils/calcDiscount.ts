export function calcDiscount(subtotal: number, discountPercent: number): number {
  return Math.round(subtotal * discountPercent) / 100;
}
