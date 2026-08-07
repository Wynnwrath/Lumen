import { seedDefaultUsers } from "./auth.seed.js";
import { seedCategories } from "./category.seed.js";
import { seedProducts } from "./product.seed.js";
import { seedCoupons } from "./coupon.seed.js";

// Runs every seed, in dependency-ish order. Called at boot (dev) and by `npm run db:seed`.
export async function runAllSeeds(): Promise<void> {
  await seedCategories();
  await seedProducts();
  await seedCoupons();
  await seedDefaultUsers();
}

// Standalone entry for `npm run db:seed`.
async function run(): Promise<void> {
  await runAllSeeds();
  console.log("Seeding complete.");
}

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
