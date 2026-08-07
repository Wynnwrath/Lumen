import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { calcDiscount } from "../../utils/calcDiscount.js";

export const couponService = {
  async validate(code: string, subtotal: number) {
    const coupon = await prisma.coupon.findFirst({
      where: { code: code.toUpperCase(), isActive: true },
    });
    if (!coupon) throw new AppError("Invalid or expired coupon", 400, "INVALID_COUPON");

    const discountAmount = Math.min(calcDiscount(subtotal, coupon.discountPercent), subtotal);
    return { code: coupon.code, discountPercent: coupon.discountPercent, discountAmount };
  },

  async getAll() {
    return prisma.coupon.findMany();
  },
};
