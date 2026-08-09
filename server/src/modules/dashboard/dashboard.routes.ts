import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.js";
import { dashboardController } from "./dashboard.controller.js";

const router = Router();

// Public aggregate stats for the admin login showcase (no auth — login page
// renders before a session exists). Same numbers, admin-only detail withheld.
router.get("/public-stats", dashboardController.publicStats);

// Admin-only metrics endpoints.
router.get("/stats", protect, authorize("admin"), dashboardController.stats);
router.get("/charts", protect, authorize("admin"), dashboardController.charts);

export default router;
