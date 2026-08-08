import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { requireFound } from "../../utils/requireFound.js";
import { calcDiscount } from "../../utils/calcDiscount.js";
import type { CreateCouponInput, UpdateCouponInput } from "./coupon.validator.js";

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
    return prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  },

  async create(input: CreateCouponInput) {
    return prisma.coupon.create({
      data: {
        code: input.code.toUpperCase(),
        discountPercent: input.discountPercent,
        isActive: input.isActive ?? true,
      },
    });
  },

  async update(code: string, input: UpdateCouponInput) {
    await requireFound(await prisma.coupon.findUnique({ where: { code } }), "Coupon");
    return prisma.coupon.update({
      where: { code },
      data: {
        ...(input.code ? { code: input.code.toUpperCase() } : {}),
        ...(input.discountPercent !== undefined ? { discountPercent: input.discountPercent } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      },
    });
  },

  async remove(code: string) {
    await requireFound(await prisma.coupon.findUnique({ where: { code } }), "Coupon");
    return prisma.coupon.delete({ where: { code } });
  },
};
