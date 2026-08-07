import type { Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { customerService } from "./customer.service.js";
import { toApi } from "../../utils/toApi.js";

// Thin layer: delegate to the service, wrap the result in the envelope.
export const customerController = {
  getAll: asyncHandler(async (_req, res: Response) => {
    const data = await customerService.getAll();
    res.json({ success: true, data: toApi(data) });
  }),
};
