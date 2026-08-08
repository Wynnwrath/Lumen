import { useMemo } from "react";
import { isPendingStatus, isCompletedStatus } from "../constants";
import type { Order } from "../types";

// Shared admin order metrics (dashboard + orders page) so the math lives in
// one place instead of being copied between pages.
export function useOrderMetrics(orders: Order[]) {
  return useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== "Cancelled");
    const totalRevenue = activeOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const orderCount = orders.length;
    const pendingCount = orders.filter((o) => isPendingStatus(o.status)).length;
    const completedCount = orders.filter((o) => isCompletedStatus(o.status)).length;
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    // Top selling products: aggregate units sold per product name.
    const counts = new Map<string, number>();
    activeOrders.forEach((o) =>
      o.items.forEach((item) => counts.set(item.name, (counts.get(item.name) || 0) + item.quantity))
    );
    const topProducts = [...counts.entries()]
      .map(([name, units]) => ({ name, units }))
      .sort((a, b) => b.units - a.units)
      .slice(0, 5);

    return { totalRevenue, orderCount, pendingCount, completedCount, avgOrderValue, topProducts };
  }, [orders]);
}
