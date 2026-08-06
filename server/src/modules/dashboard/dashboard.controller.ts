import type { Response } from "express";
import { prisma } from "../../lib/prisma.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

export const dashboardController = {
  stats: asyncHandler(async (_req, res: Response) => {
    const [totalProducts, totalOrders, totalCustomers, lowStock, completedOrders, pendingOrders, salesAgg] =
      await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.user.count({ where: { role: "customer" } }),
        prisma.product.count({ where: { stock: { lt: 5 } } }),
        prisma.order.count({ where: { status: "Completed" } }),
        prisma.order.count({ where: { status: "Pending" } }),
        prisma.order.aggregate({
          where: { status: { not: "Cancelled" } },
          _sum: { total: true },
        }),
      ]);

    res.json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalCustomers,
        pendingOrders,
        completedOrders,
        totalSales: salesAgg._sum.total || 0,
        lowStockItems: lowStock,
      },
    });
  }),
};
