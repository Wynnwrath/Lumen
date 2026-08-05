import type { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authService } from "./auth.service.js";

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.registerUser(req.body);
    res.status(201).json({ success: true, data: result });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.loginUser(req.body);
    res.json({ success: true, data: result });
  }),

  loginAdmin: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.loginAdmin(req.body);
    res.json({ success: true, data: result });
  }),
};
