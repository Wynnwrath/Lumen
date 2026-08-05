import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.js";
import { couponController } from "./coupon.controller.js";

const router = Router();

router.post("/validate", couponController.validateCoupon);
router.get("/", protect, authorize("admin"), couponController.getAll);

export default router;
