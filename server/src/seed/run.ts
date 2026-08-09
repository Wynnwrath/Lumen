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

// Standalone entry for `npm run db:seed`. Refuses to run against production so
// demo data can't be (re)seeded on a deployed environment.
async function run(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    console.error("Seeding is disabled in production. Run locally with NODE_ENV unset.");
    process.exit(1);
  }
  await runAllSeeds();
  console.log("Seeding complete.");
}

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
