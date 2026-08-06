import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { AppError } from "../../utils/AppError.js";
import { calcDiscount } from "../../utils/calcDiscount.js";
import { toApi } from "../../utils/toApi.js";

export const couponController = {
  validateCoupon: asyncHandler(async (req: Request, res: Response) => {
    const { code, subtotal } = req.body;
    if (!code || subtotal === undefined) {
      throw new AppError("Provide coupon code and subtotal", 400);
    }

    const coupon = await prisma.coupon.findFirst({
      where: { code: code.toUpperCase(), isActive: true },
    });
    if (!coupon) throw new AppError("Invalid or expired coupon", 400, "INVALID_COUPON");

    const discountAmount = calcDiscount(subtotal, coupon.discountPercent);
    res.json({
      success: true,
      data: { code: coupon.code, discountPercent: coupon.discountPercent, discountAmount },
    });
  }),

  getAll: asyncHandler(async (_req: Request, res: Response) => {
    const coupons = await prisma.coupon.findMany();
    res.json({ success: true, data: toApi(coupons) });
  }),
};
