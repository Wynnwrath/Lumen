import { prisma } from "../../lib/prisma.js";

export const dashboardService = {
  // Top-level numbers for the admin dashboard KPI cards.
  async stats() {
    const [totalProducts, totalOrders, totalCustomers, lowStock, completedOrders, pendingOrders, salesAgg] =
      await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.user.count({ where: { role: "customer" } }),
        prisma.product.count({ where: { stock: { lt: 5 } } }),
        prisma.order.count({ where: { status: { in: ["Completed", "Received"] } } }),
        prisma.order.count({ where: { status: "Pending" } }),
        // Total revenue, excluding cancelled orders.
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

  // Revenue per day (last 7 days) + order counts per status.
  async charts() {
    const [orders, byStatus] = await Promise.all([
      prisma.order.findMany({
        where: { status: { not: "Cancelled" } },
        select: { total: true, createdAt: true },
      }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    ]);

    // Build the last 7 days, all starting at 0.
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

    // Bucket each order into its day.
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
