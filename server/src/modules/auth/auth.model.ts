import mongoose, { type Document, type Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

export interface IAdmin extends Document {
  storeName: string;
  email: string;
  password: string;
  role: "admin";
  category?: string;
  createdAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    phone: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const adminSchema = new mongoose.Schema<IAdmin>(
  {
    storeName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ["admin"], default: "admin" },
    category: { type: String, default: "" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

adminSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const UserModel: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export const AdminModel: Model<IAdmin> = mongoose.model<IAdmin>("Admin", adminSchema);

export async function seedDefaultUsers(): Promise<void> {
  const userExists = await UserModel.findOne({ email: "alex.morgan@lumen.com" });
  if (!userExists) {
    await UserModel.create({
      name: "Alex Morgan",
      email: "alex.morgan@lumen.com",
      password: "password123",
      phone: "+1 (555) 234-5678",
    });
    console.log("Seeded demo customer: alex.morgan@lumen.com / password123");
  }

  const adminExists = await AdminModel.findOne({ email: "admin@lumen.com" });
  if (!adminExists) {
    await AdminModel.create({
      storeName: "Lumen Official Store",
      email: "admin@lumen.com",
      password: "password123",
      role: "admin",
      category: "electronics",
    });
    console.log("Seeded admin: admin@lumen.com / password123");
  }
}
