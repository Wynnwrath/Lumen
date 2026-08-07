import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { categoryService } from "./category.service.js";
import type { CreateCategoryInput } from "./category.validator.js";
import { toApi } from "../../utils/toApi.js";

// Thin layer: delegate to the service, wrap the result in the envelope.
export const categoryController = {
  getAll: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await categoryService.findAll();
    res.json({ success: true, data: toApi(categories) });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.create(req.body as CreateCategoryInput);
    res.status(201).json({ success: true, data: toApi(category) });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const category = await categoryService.update(req.params.slug, req.body);
    res.json({ success: true, data: toApi(category) });
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await categoryService.remove(req.params.slug);
    res.json({ success: true, data: null });
  }),
};
