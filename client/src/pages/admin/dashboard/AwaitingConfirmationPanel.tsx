import { useMemo } from "react";
import type { Order } from "../../../types";

interface AwaitingConfirmationPanelProps {
  orders: Order[];
}

export const AwaitingConfirmationPanel = ({ orders }: AwaitingConfirmationPanelProps) => {
  const awaiting = useMemo(
    () =>
      orders
        .filter((o) => o.status === "Completed")
        .sort((a, b) => {
          const aTime = new Date(a.completedAt || a.createdAt).getTime();
          const bTime = new Date(b.completedAt || b.createdAt).getTime();
          return aTime - bTime;
        }),
    [orders]
  );

  const daysSince = (order: Order): number => {
    const anchor = new Date(order.completedAt || order.createdAt).getTime();
    return Math.floor((Date.now() - anchor) / (24 * 60 * 60 * 1000));
  };

  return (
    <div className="lg:col-span-12 bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm transition-colors duration-200 rounded-none">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Awaiting Confirmation</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Orders delivered but not yet confirmed by customers</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
          {awaiting.length} Orders
        </span>
      </div>

      {awaiting.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
          All delivered orders have been confirmed.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-64 overflow-y-auto">
          {awaiting.slice(0, 6).map((o) => (
            <div key={o._id} className="py-2.5 px-1 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">#{o.orderNumber}</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[140px]">{o.customer.name}</span>
                <span className="text-slate-500 dark:text-slate-400 shrink-0">{o.items.length} items</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono font-bold text-slate-900 dark:text-white">${o.total.toFixed(2)}</span>
                <span className="text-slate-500 dark:text-slate-400 font-medium">{daysSince(o) > 0 ? `${daysSince(o)}d` : "today"}</span>
              </div>
            </div>
          ))}
          {awaiting.length > 6 && (
            <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 py-2">+{awaiting.length - 6} more</p>
          )}
        </div>
      )}
    </div>
  );
};
