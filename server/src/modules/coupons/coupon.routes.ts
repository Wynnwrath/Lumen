import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  validateCouponSchema,
  createCouponSchema,
  updateCouponSchema,
} from "./coupon.validator.js";
import { couponController } from "./coupon.controller.js";

const router = Router();

// Anyone can check a coupon at checkout; everything else is admin-only.
router.post("/validate", validate(validateCouponSchema), couponController.validateCoupon);
router.get("/", protect, authorize("admin"), couponController.getAll);
router.post("/", protect, authorize("admin"), validate(createCouponSchema), couponController.create);
router.patch("/:code", protect, authorize("admin"), validate(updateCouponSchema), couponController.update);
router.delete("/:code", protect, authorize("admin"), couponController.remove);

export default router;
