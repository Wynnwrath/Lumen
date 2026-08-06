import { config } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { seedDefaultUsers } from "./seed/auth.seed.js";
import { seedProducts } from "./seed/product.seed.js";
import { seedCategories } from "./seed/category.seed.js";
import { seedCoupons } from "./seed/coupon.seed.js";
import app from "./app.js";

async function start() {
  await connectDB();

  await seedCategories();
  await seedProducts();
  await seedCoupons();
  await seedDefaultUsers();

  app.listen(config.port, () => {
    console.log(`Lumen API running on http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
