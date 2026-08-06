import { seedDefaultUsers } from "./auth.seed.js";
import { seedCategories } from "./category.seed.js";
import { seedProducts } from "./product.seed.js";
import { seedCoupons } from "./coupon.seed.js";

async function run(): Promise<void> {
  await seedCategories();
  await seedProducts();
  await seedCoupons();
  await seedDefaultUsers();
  console.log("Seeding complete.");
}

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
