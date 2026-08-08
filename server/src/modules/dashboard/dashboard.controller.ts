import type { Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { dashboardService } from "./dashboard.service.js";
import { toApi } from "../../utils/toApi.js";

// Thin layer: delegate to the service, wrap the result in the envelope.
export const dashboardController = {
  stats: asyncHandler(async (_req, res: Response) => {
    res.json({ success: true, data: toApi(await dashboardService.stats()) });
  }),

  charts: asyncHandler(async (_req, res: Response) => {
    res.json({ success: true, data: toApi(await dashboardService.charts()) });
  }),
};
