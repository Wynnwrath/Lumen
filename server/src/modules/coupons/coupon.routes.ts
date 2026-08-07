import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { validateCouponSchema } from "./coupon.validator.js";
import { couponController } from "./coupon.controller.js";

const router = Router();

router.post("/validate", validate(validateCouponSchema), couponController.validateCoupon);
router.get("/", protect, authorize("admin"), couponController.getAll);

export default router;
