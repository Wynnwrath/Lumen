import type { Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { orderService } from "./order.service.js";
import type { RequestWithUser } from "../../types/request.js";
import { toApi } from "../../utils/toApi.js";

export const orderController = {
  create: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const order = await orderService.createOrder(req.body, req.user!.id);
    res.status(201).json({ success: true, data: toApi(order) });
  }),

  getAll: asyncHandler(async (req, res: Response) => {
    const result = await orderService.getAll(req.query as Record<string, string>);
    res.json({ success: true, data: toApi(result) });
  }),

  getByOrderNumber: asyncHandler(async (req, res: Response) => {
    const order = await orderService.getByOrderNumber(req.params.orderNumber);
    res.json({ success: true, data: toApi(order) });
  }),

  updateStatus: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const order = await orderService.updateStatus(req.params.orderNumber, req.body.status);
    res.json({ success: true, data: toApi(order) });
  }),
};
