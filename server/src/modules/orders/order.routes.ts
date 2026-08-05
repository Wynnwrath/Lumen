import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createOrderSchema, updateOrderStatusSchema, orderQuerySchema } from "./order.validator.js";
import { orderController } from "./order.controller.js";

const router = Router();

router.post("/", protect, validate(createOrderSchema), orderController.create);
router.get("/", protect, authorize("admin"), validate(orderQuerySchema, "query"), orderController.getAll);
router.get("/:orderNumber", orderController.getByOrderNumber);
router.patch("/:orderNumber/status", protect, authorize("admin"), validate(updateOrderStatusSchema), orderController.updateStatus);

export default router;
