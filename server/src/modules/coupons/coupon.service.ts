import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { calcDiscount } from "../../utils/calcDiscount.js";

export const couponService = {
  // Checks a code at checkout and returns the discount it gives on a subtotal.
  async validate(code: string, subtotal: number) {
    // Codes are case-insensitive; only active coupons count.
    const coupon = await prisma.coupon.findFirst({
      where: { code: code.toUpperCase(), isActive: true },
    });
    if (!coupon) throw new AppError("Invalid or expired coupon", 400, "INVALID_COUPON");

    // Clamp so the discount can't exceed the subtotal.
    const discountAmount = Math.min(calcDiscount(subtotal, coupon.discountPercent), subtotal);
    return { code: coupon.code, discountPercent: coupon.discountPercent, discountAmount };
  },

  async getAll() {
    return prisma.coupon.findMany();
  },
};
