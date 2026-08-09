import type { Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { orderService } from "./order.service.js";
import type { RequestWithUser } from "../../types/request.js";
import type { OrderQuery } from "./order.validator.js";
import { requireUser } from "../../utils/requireUser.js";

// Thin layer: delegate to the service, wrap the result in the envelope.
export const orderController = {
  create: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const order = await orderService.createOrder(req.body, requireUser(req).id);
    res.status(201).json({ success: true, data: order });
  }),

  getAll: asyncHandler(async (req, res: Response) => {
    const result = await orderService.getAll(req.query as unknown as OrderQuery);
    res.json({ success: true, data: result });
  }),

  getByOrderNumber: asyncHandler(async (req, res: Response) => {
    const order = await orderService.getByOrderNumber(req.params.orderNumber);
    res.json({ success: true, data: order });
  }),

  getMine: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const orders = await orderService.getMine(requireUser(req).id);
    res.json({ success: true, data: orders });
  }),

  exportCsv: asyncHandler(async (_req, res: Response) => {
    const csv = await orderService.exportCsv();
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="orders.csv"');
    // Never cache the generated CSV, or the browser serves stale/blank exports.
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    res.send(csv);
  }),

  updateStatus: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const order = await orderService.updateStatus(req.params.orderNumber, req.body.status);
    res.json({ success: true, data: order });
  }),

  confirmReceived: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const order = await orderService.confirmReceived(req.params.orderNumber, requireUser(req).id);
    res.json({ success: true, data: order });
  }),
};
