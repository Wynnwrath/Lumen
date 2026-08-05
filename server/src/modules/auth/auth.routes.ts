import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { registerUserSchema, loginSchema } from "./auth.validator.js";
import { authController } from "./auth.controller.js";

const router = Router();

router.post("/register", validate(registerUserSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/admin/login", validate(loginSchema), authController.loginAdmin);

export default router;
