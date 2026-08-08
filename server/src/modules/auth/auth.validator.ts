import { z } from "zod";
import { PHONE_PATTERN } from "../../utils/validation.js";

// Rules for the data each auth endpoint accepts. Zod validates at runtime
// AND gives us the TypeScript type for free via z.infer.

export const registerUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[0-9]/, "Password must include a number")
    .regex(/[^A-Za-z0-9]/, "Password must include a special character"),
  phone: z.string().regex(PHONE_PATTERN, "Invalid phone number").optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
