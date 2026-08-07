import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createOrderSchema, updateOrderStatusSchema, orderQuerySchema } from "./order.validator.js";
import { orderController } from "./order.controller.js";

const router = Router();

// Placing an order requires login (protect). Listing/exporting/status changes are admin.
// `/mine` and `/export` must come before `/:orderNumber` so they aren't read as an order number.
router.post("/", protect, validate(createOrderSchema), orderController.create);
router.get("/", protect, authorize("admin"), validate(orderQuerySchema, "query"), orderController.getAll);
router.get("/mine", protect, orderController.getMine);
router.get("/export", protect, authorize("admin"), orderController.exportCsv);
router.get("/:orderNumber", protect, authorize("admin"), orderController.getByOrderNumber);
router.patch("/:orderNumber/status", protect, authorize("admin"), validate(updateOrderStatusSchema), orderController.updateStatus);
// Customer confirms receipt of their own Completed order (delivery settlement).
router.post("/:orderNumber/confirm-received", protect, orderController.confirmReceived);

export default router;
