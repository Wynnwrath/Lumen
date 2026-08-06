import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.js";
import { customerController } from "./customer.controller.js";

const router = Router();

router.get("/", protect, authorize("admin"), customerController.getAll);

export default router;
