import { prisma } from "../../lib/prisma.js";

export const customerService = {
  // Admin customer directory: one row per customer with their order stats.
  async getAll() {
    const users = await prisma.user.findMany({
      where: { role: "customer" },
      include: { orders: { select: { total: true, address: true, status: true }, orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    return users.map((u) => {
      // Don't count cancelled orders as sales.
      const active = u.orders.filter((o) => o.status !== "Cancelled");
      const totalSpent = active.reduce((sum, o) => sum + (o.total || 0), 0);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        registeredAt: u.createdAt,
        totalOrders: u.orders.length,
        totalSpent,
        // First order's address as a stand-in shipping address.
        address: u.orders[0]?.address ?? "",
      };
    });
  },
};
