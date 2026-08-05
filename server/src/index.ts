import { config } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { seedDefaultUsers } from "./modules/auth/auth.model.js";
import { seedProducts } from "./modules/products/product.model.js";
import { seedCategories } from "./modules/categories/category.model.js";
import { seedCoupons } from "./modules/coupons/coupon.model.js";
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
