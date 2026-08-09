import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { couponService } from "./coupon.service.js";

// Thin layer: delegate to the service, wrap the result in the envelope.
export const couponController = {
  validateCoupon: asyncHandler(async (req: Request, res: Response) => {
    const { code, subtotal } = req.body;
    const data = await couponService.validate(code, subtotal);
    res.json({ success: true, data: data });
  }),

  getAll: asyncHandler(async (_req: Request, res: Response) => {
    const coupons = await couponService.getAll();
    res.json({ success: true, data: coupons });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const coupon = await couponService.create(req.body);
    res.status(201).json({ success: true, data: coupon });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const coupon = await couponService.update(req.params.code, req.body);
    res.json({ success: true, data: coupon });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await couponService.remove(req.params.code);
    res.json({ success: true, data: null });
  }),
};
