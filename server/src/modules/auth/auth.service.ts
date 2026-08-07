import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { signToken } from "../../utils/signToken.js";
import { hashPassword, comparePassword } from "./auth.model.js";
import type { RegisterUserInput, LoginInput } from "./auth.validator.js";

export const authService = {
  async registerUser(input: RegisterUserInput) {
    // Emails are unique, so check first.
    const exists = await prisma.user.findUnique({ where: { email: input.email } });
    if (exists) throw new AppError("Email already registered", 400, "EMAIL_EXISTS");

    // Never store the raw password.
    const hashed = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, password: hashed, phone: input.phone },
    });
    const token = signToken(user.id, "customer");
    return { user: { id: user.id, name: user.name, email: user.email, role: "customer" }, token };
  },

  async loginUser(input: LoginInput) {
    const user = await prisma.user.findFirst({
      where: { email: input.email, role: "customer" },
    });
    if (!user) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");

    // Same error for "no user" and "wrong password" so we don't leak which one.
    const match = await comparePassword(input.password, user.password);
    if (!match) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");

    const token = signToken(user.id, "customer");
    return { user: { id: user.id, name: user.name, email: user.email, role: "customer" }, token };
  },

  async loginAdmin(input: LoginInput) {
    const user = await prisma.user.findFirst({
      where: { email: input.email, role: "admin" },
    });
    if (!user) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");

    const match = await comparePassword(input.password, user.password);
    if (!match) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");

    const token = signToken(user.id, "admin");
    return {
      user: { id: user.id, name: user.storeName || user.name, email: user.email, role: "admin" },
      token,
    };
  },
};
