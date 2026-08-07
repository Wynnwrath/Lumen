import { prisma } from "../../lib/prisma.js";

export const dashboardService = {
  async stats() {
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

    return {
      totalProducts,
      totalOrders,
      totalCustomers,
      pendingOrders,
      completedOrders,
      totalSales: salesAgg._sum.total || 0,
      lowStockItems: lowStock,
    };
  },

  async charts() {
    const [orders, byStatus] = await Promise.all([
      prisma.order.findMany({
        where: { status: { not: "Cancelled" } },
        select: { total: true, createdAt: true },
      }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);

    const days: { date: string; label: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        total: 0,
      });
    }

    orders.forEach((o) => {
      const dayKey = new Date(o.createdAt).toISOString().slice(0, 10);
      const bucket = days.find((x) => x.date === dayKey);
      if (bucket) bucket.total += o.total;
    });

    return {
      revenueByDay: days,
      ordersByStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all })),
    };
  },
};
