import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} from "./product.validator.js";
import { productController } from "./product.controller.js";

const router = Router();

// Browsing is public; writing (create/update/delete) is admin-only.
// `manage` must come before `/:id` so it isn't treated as an id.
router.get("/", validate(productQuerySchema, "query"), productController.getAll);
router.get("/manage", protect, authorize("admin"), productController.getAllForAdmin);
router.get("/:id", productController.getById);
router.post("/", protect, authorize("admin"), validate(createProductSchema), productController.create);
router.patch("/:id", protect, authorize("admin"), validate(updateProductSchema), productController.update);
router.delete("/:id", protect, authorize("admin"), productController.remove);

export default router;
