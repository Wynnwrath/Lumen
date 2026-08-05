import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import { createCategorySchema, updateCategorySchema } from "./category.validator.js";
import { categoryController } from "./category.controller.js";

const router = Router();

router.get("/", categoryController.getAll);
router.post("/", protect, authorize("admin"), validate(createCategorySchema), categoryController.create);
router.patch("/:slug", protect, authorize("admin"), validate(updateCategorySchema), categoryController.update);
router.delete("/:slug", protect, authorize("admin"), categoryController.remove);

export default router;
