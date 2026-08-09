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
// demo data can't be (re)seeded on a deployed environment. Only runs when this
// file is executed directly (npm run db:seed), NOT when imported by index.ts.
async function run(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    console.error("Seeding is disabled in production. Run locally with NODE_ENV unset.");
    process.exit(1);
  }
  await runAllSeeds();
  console.log("Seeding complete.");
}

// `require.main === module` is true only when this file is the entry point.
// When index.ts imports runAllSeeds, this is false, so the guard doesn't fire.
if (require.main === module) {
  run().catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
}
