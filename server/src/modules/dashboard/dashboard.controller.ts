import type { Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { dashboardService } from "./dashboard.service.js";

export const dashboardController = {
  stats: asyncHandler(async (_req, res: Response) => {
    res.json({ success: true, data: await dashboardService.stats() });
  }),

  charts: asyncHandler(async (_req, res: Response) => {
    res.json({ success: true, data: await dashboardService.charts() });
  }),
};
