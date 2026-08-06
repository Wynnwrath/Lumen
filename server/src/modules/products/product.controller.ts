import type { Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { productService } from "./product.service.js";
import type { RequestWithUser } from "../../types/request.js";
import type { ProductQuery } from "./product.validator.js";
import { toApi } from "../../utils/toApi.js";

export const productController = {
  getAll: asyncHandler(async (req, res: Response) => {
    // Query is validated + coerced by validate(productQuerySchema, "query") in the route.
    const result = await productService.findAll(req.query as unknown as ProductQuery);
    res.json({ success: true, data: toApi(result) });
  }),

  getById: asyncHandler(async (req, res: Response) => {
    const product = await productService.findById(req.params.id);
    res.json({ success: true, data: toApi(product) });
  }),

  getAllForAdmin: asyncHandler(async (_req, res: Response) => {
    const result = await productService.findAllForAdmin();
    res.json({ success: true, data: toApi(result) });
  }),

  create: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const product = await productService.create(req.body);
    res.status(201).json({ success: true, data: toApi(product) });
  }),

  update: asyncHandler(async (req: RequestWithUser, res: Response) => {
    const product = await productService.update(req.params.id, req.body);
    res.json({ success: true, data: toApi(product) });
  }),

  remove: asyncHandler(async (req: RequestWithUser, res: Response) => {
    await productService.remove(req.params.id);
    res.json({ success: true, data: null });
  }),
};
