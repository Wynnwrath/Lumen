import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { orderService } from "./order.service.js";
import type { RequestWithUser } from "../../types/request.js";
import type { OrderQuery } from "./order.validator.js";
import { requireUser } from "../../utils/requireUser.js";
import { toApi } from "../../utils/toApi.js";

export const orderController = {
  create: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const order = await orderService.createOrder(req.body, requireUser(req).id);
    res.status(201).json({ success: true, data: toApi(order) });
  }),

  getAll: asyncHandler(async (req, res: Response) => {
    // Query is validated + coerced by validate(orderQuerySchema, "query") in the route,
    // which stores the parsed result on req.validatedQuery.
    const query = (req as Request & { validatedQuery?: OrderQuery }).validatedQuery ?? {};
    const result = await orderService.getAll(query);
    res.json({ success: true, data: toApi(result) });
  }),

  getByOrderNumber: asyncHandler(async (req, res: Response) => {
    const order = await orderService.getByOrderNumber(req.params.orderNumber);
    res.json({ success: true, data: toApi(order) });
  }),

  getMine: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const orders = await orderService.getMine(requireUser(req).id);
    res.json({ success: true, data: toApi(orders) });
  }),

  exportCsv: asyncHandler(async (_req, res: Response) => {
    const csv = await orderService.exportCsv();
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="orders.csv"');
    res.send(csv);
  }),

  updateStatus: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const order = await orderService.updateStatus(req.params.orderNumber, req.body.status);
    res.json({ success: true, data: toApi(order) });
  }),
};
