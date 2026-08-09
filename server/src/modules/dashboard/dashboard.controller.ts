import type { Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { dashboardService } from "./dashboard.service.js";

// Thin layer: delegate to the service, wrap the result in the envelope.
export const dashboardController = {
  stats: asyncHandler(async (_req, res: Response) => {
    res.json({ success: true, data: await dashboardService.stats() });
  }),

  // Public variant of `stats` for the unauthenticated admin login showcase.
  publicStats: asyncHandler(async (_req, res: Response) => {
    res.json({ success: true, data: await dashboardService.stats() });
  }),

  charts: asyncHandler(async (_req, res: Response) => {
    res.json({ success: true, data: await dashboardService.charts() });
  }),
};
