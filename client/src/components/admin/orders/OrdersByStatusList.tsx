import { EmptyState } from "../../ui/EmptyState";
import type { DashboardCharts } from "../../../api/dashboard";

interface OrdersByStatusListProps {
  data: DashboardCharts["ordersByStatus"];
}

export const OrdersByStatusList = ({ data }: OrdersByStatusListProps) => {
  return (
    <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm rounded-none">
      <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Orders by Status</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4 font-medium">Current order distribution</p>
      {data.length === 0 ? (
        <EmptyState message="No orders recorded yet." className="py-10 text-center text-sm text-slate-500 dark:text-slate-400" />
      ) : (
        <div className="space-y-3">
          {data.map((s) => {
            const total = data.reduce((sum, x) => sum + x.count, 0) || 1;
            const pct = Math.round((s.count / total) * 100);
            return (
              <div key={s.status} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{s.status}</span>
                  <span className="font-mono font-semibold text-slate-500 dark:text-slate-400">{s.count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
