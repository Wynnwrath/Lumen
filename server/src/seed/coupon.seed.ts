import { prisma } from "../lib/prisma.js";

// Demo discount codes.
const SEED_COUPONS = [
  { code: "LUMEN10", discountPercent: 10, isActive: true },
  { code: "LUMEN20", discountPercent: 20, isActive: true },
  { code: "FREESHIP", discountPercent: 5, isActive: true },
];

// Only seeds if the table is empty (idempotent).
export async function seedCoupons(): Promise<void> {
  const count = await prisma.coupon.count();
  if (count === 0) {
    await prisma.coupon.createMany({ data: SEED_COUPONS });
    console.log(`Seeded ${SEED_COUPONS.length} coupons`);
  }
}
