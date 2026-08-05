import type { Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { ProductModel } from "../products/product.model.js";
import { OrderModel } from "../orders/order.model.js";
import { UserModel } from "../auth/auth.model.js";

export const dashboardController = {
  stats: asyncHandler(async (_req, res: Response) => {
    const [totalProducts, totalOrders, totalCustomers, lowStock, completedOrders, pendingOrders, totalSalesResult] =
      await Promise.all([
        ProductModel.countDocuments(),
        OrderModel.countDocuments(),
        UserModel.countDocuments(),
        ProductModel.countDocuments({ stock: { $lt: 5 } }),
        OrderModel.countDocuments({ status: "Completed" }),
        OrderModel.countDocuments({ status: "Pending" }),
        OrderModel.aggregate([
          { $match: { status: { $ne: "Cancelled" } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]),
      ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalCustomers,
        pendingOrders,
        completedOrders,
        totalSales: totalSalesResult[0]?.total || 0,
        lowStockItems: lowStock,
      },
    });
  }),
};
