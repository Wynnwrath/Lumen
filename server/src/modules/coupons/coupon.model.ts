import mongoose, { type Document, type Model } from "mongoose";
import { seedIfEmpty } from "../../utils/seedIfEmpty.js";

export interface ICoupon extends Document {
  code: string;
  discountPercent: number;
  isActive: boolean;
}

const couponSchema = new mongoose.Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountPercent: { type: Number, required: true, min: 0, max: 100 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CouponModel: Model<ICoupon> = mongoose.model<ICoupon>("Coupon", couponSchema);

const SEED_COUPONS = [
  { code: "LUMEN10", discountPercent: 10, isActive: true },
  { code: "LUMEN20", discountPercent: 20, isActive: true },
  { code: "FREESHIP", discountPercent: 5, isActive: true },
];

export async function seedCoupons(): Promise<void> {
  await seedIfEmpty(CouponModel, SEED_COUPONS, "coupons");
}
