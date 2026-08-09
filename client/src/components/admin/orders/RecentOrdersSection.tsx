import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../../ui/Icon";
import { EmptyState } from "../../ui/EmptyState";
import { StatusBadge, getStatusClasses } from "../../ui/StatusBadge";
import { Card } from "../../ui/Card";
import { OrderStatusSelect } from "./OrderStatusSelect";
import { Button } from "../../ui/Button";
import { AdminPagination } from "../shared/AdminPagination";
import { usePagination } from "../../../hooks/usePagination";
import { formatDate, formatMoney } from "../../../utils/format";
import { isPendingStatus, isCompletedStatus } from "../../../constants";
import type { Order, OrderStatus } from "../../../types";

interface RecentOrdersSectionProps {
  orders: Order[];
  onOpenDetails: (order: Order) => void;
  onUpdateStatus: (orderNumber: string, status: OrderStatus) => void;
}

export const RecentOrdersSection = ({ orders, onOpenDetails, onUpdateStatus }: RecentOrdersSectionProps) => {
  const [orderFilter, setOrderFilter] = useState<string>("all");

  // Filtered recent orders (capped to the 9 newest; paginated 3 at a time).
  const recentOrders = useMemo(() => {
    return orders
      .filter((o) => {
        if (orderFilter === "pending") return isPendingStatus(o.status);
        if (orderFilter === "completed") return isCompletedStatus(o.status);
        return true;
      })
      .slice(0, 9);
  }, [orders, orderFilter]);

  const { page, setPage, totalPages, totalItems, start, end, paginated } = usePagination(recentOrders, 3);

  return (
    <Card variant="admin" className="lg:col-span-8 overflow-hidden transition-colors duration-200 flex flex-col">
      <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Recent Transactions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Customer orders and real-time status management</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Filter:</span>
          <select
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl px-3 py-1.5 outline-none cursor-pointer"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1 shrink-0"
          >
            View all
            <Icon name="arrow_forward" className="text-xs" />
          </Link>
        </div>
      </div>

      {/* Table Container: Mobile Cards (screen < md) & Desktop Table (screen >= md) */}
      <div className="p-4 sm:p-6 pt-0 sm:pt-0 flex-1 flex flex-col">
        {/* Mobile View: High-Density Transaction Cards */}
        <div className="block md:hidden space-y-3 mt-3">
          {recentOrders.length === 0 ? (
            <EmptyState message="No orders recorded yet." />
          ) : (
            paginated.map((ord) => (
              <div
                key={ord.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      #{ord.orderNumber}
                    </span>
                    <StatusBadge status={ord.status} />
                  </div>
                  <span className="font-mono font-extrabold text-sm text-slate-900 dark:text-white">
                    {formatMoney(ord.total)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{ord.customer.name}</p>
                    <p className="text-[10px] text-slate-500">{ord.customer.email || "N/A"}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{formatDate(ord.createdAt, { month: "short", day: "numeric" })}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <OrderStatusSelect
                    value={ord.status}
                    onChange={(st) => onUpdateStatus(ord.orderNumber, st)}
                    className={`text-[11px] font-bold rounded-lg px-2.5 py-1 outline-none border cursor-pointer ${getStatusClasses(ord.status)}`}
                  />

                  <Button variant="blue" size="sm" onClick={() => onOpenDetails(ord)}>Details</Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Multi-Column Table (screen >= md) */}
        <div className="hidden md:block overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-5 py-3.5">Order #</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dashed divide-slate-200 dark:divide-slate-800 text-xs sm:text-sm">
              {recentOrders.length === 0 ? (
                <EmptyState message="No orders recorded yet." colSpan={6} />
              ) : (
                paginated.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition border-b border-dashed border-slate-200 dark:border-slate-800">
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-slate-100 font-mono">
                      {ord.orderNumber}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{ord.customer.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{ord.customer.email || "N/A"}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400 font-medium">
                      {formatDate(ord.createdAt, { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-5 py-4 font-extrabold text-slate-900 dark:text-white font-mono">
                      {formatMoney(ord.total)}
                      <Icon name="north_east" className="text-emerald-600 dark:text-emerald-400 text-xs align-middle inline-block ml-0.5" />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={ord.status} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <OrderStatusSelect
                          value={ord.status}
                          onChange={(st) => onUpdateStatus(ord.orderNumber, st)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none border cursor-pointer ${getStatusClasses(ord.status)}`}
                        />
                        <Button variant="outline" size="sm" onClick={() => onOpenDetails(ord)}>Details</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          start={start}
          end={end}
          onChange={setPage}
        />
      </div>
    </Card>
  );
};
