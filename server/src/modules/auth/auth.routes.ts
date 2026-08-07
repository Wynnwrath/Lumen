import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../../middleware/validate.js";
import { registerUserSchema, loginSchema } from "./auth.validator.js";
import { authController } from "./auth.controller.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post("/register", validate(registerUserSchema), authController.register);
router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/admin/login", authLimiter, validate(loginSchema), authController.loginAdmin);

export default router;
