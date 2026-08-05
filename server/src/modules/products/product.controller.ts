import type { Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { productService } from "./product.service.js";
import type { RequestWithUser } from "../../types/request.js";

export const productController = {
  getAll: asyncHandler(async (req, res: Response) => {
    const result = await productService.findAll(req.query as Parameters<typeof productService.findAll>[0]);
    res.json({ success: true, data: result });
  }),

  getById: asyncHandler(async (req, res: Response) => {
    const product = await productService.findById(req.params.id);
    res.json({ success: true, data: product });
  }),

  create: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const product = await productService.create(req.body);
    res.status(201).json({ success: true, data: product });
  }),

  update: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const product = await productService.update(req.params.id, req.body);
    res.json({ success: true, data: product });
  }),

  remove: asyncHandler(async (req: RequestWithUser, res: Response) => {
    await productService.remove(req.params.id);
    res.json({ success: true, data: null });
  }),
};
