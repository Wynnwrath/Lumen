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

router.get("/", validate(productQuerySchema, "query"), productController.getAll);
router.get("/:id", productController.getById);
router.post("/", protect, authorize("admin"), validate(createProductSchema), productController.create);
router.patch("/:id", protect, authorize("admin"), validate(updateProductSchema), productController.update);
router.delete("/:id", protect, authorize("admin"), productController.remove);

export default router;
