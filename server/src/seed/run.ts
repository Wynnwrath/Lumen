import { seedDefaultUsers } from "./auth.seed.js";
import { seedCategories } from "./category.seed.js";
import { seedProducts } from "./product.seed.js";
import { seedCoupons } from "./coupon.seed.js";

export async function runAllSeeds(): Promise<void> {
  await seedCategories();
  await seedProducts();
  await seedCoupons();
  await seedDefaultUsers();
}

async function run(): Promise<void> {
  await runAllSeeds();
  console.log("Seeding complete.");
}

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
