import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { couponService } from "./coupon.service.js";
import { toApi } from "../../utils/toApi.js";

export const couponController = {
  validateCoupon: asyncHandler(async (req: Request, res: Response) => {
    const { code, subtotal } = req.body;
    const data = await couponService.validate(code, subtotal);
    res.json({ success: true, data });
  }),

  getAll: asyncHandler(async (_req: Request, res: Response) => {
    const coupons = await couponService.getAll();
    res.json({ success: true, data: toApi(coupons) });
  }),
};
