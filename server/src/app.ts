import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import productRoutes from "./modules/products/product.routes.js";
import categoryRoutes from "./modules/categories/category.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";
import couponRoutes from "./modules/coupons/coupon.routes.js";
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js";
import customerRoutes from "./modules/customers/customer.routes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());

app.get("/api", (_req, res) => {
  res.json({ success: true, data: { name: "Lumen API", version: "1.0.0" } });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/customers", customerRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: { message: "Route not found", code: "NOT_FOUND" } });
});

app.use(errorHandler);

export default app;
