import { AppError } from "../../utils/AppError.js";
import { signToken } from "../../utils/signToken.js";
import { UserModel, AdminModel } from "./auth.model.js";
import type { RegisterUserInput, LoginInput } from "./auth.validator.js";

export const authService = {
  async registerUser(input: RegisterUserInput) {
    const exists = await UserModel.findOne({ email: input.email });
    if (exists) throw new AppError("Email already registered", 400, "EMAIL_EXISTS");

    const adminExists = await AdminModel.findOne({ email: input.email });
    if (adminExists) throw new AppError("Email already registered", 400, "EMAIL_EXISTS");

    const user = await UserModel.create(input);
    const token = signToken(user._id.toString(), "customer");
    return { user: { id: user._id, name: user.name, email: user.email, role: "customer" }, token };
  },

  async loginUser(input: LoginInput) {
    const user = await UserModel.findOne({ email: input.email }).select("+password");
    if (!user) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");

    const match = await user.comparePassword(input.password);
    if (!match) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");

    const token = signToken(user._id.toString(), "customer");
    return { user: { id: user._id, name: user.name, email: user.email, role: "customer" }, token };
  },

  async loginAdmin(input: LoginInput) {
    const admin = await AdminModel.findOne({ email: input.email }).select("+password");
    if (!admin) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");

    const match = await admin.comparePassword(input.password);
    if (!match) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");

    const token = signToken(admin._id.toString(), admin.role);
    return {
      user: { id: admin._id, name: admin.storeName, email: admin.email, role: admin.role },
      token,
    };
  },
};
