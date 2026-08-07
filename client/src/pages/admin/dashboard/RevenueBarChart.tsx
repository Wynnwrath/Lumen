import { EmptyState } from "../../../components/common/EmptyState";
import type { DashboardCharts } from "../../../api/dashboard";

interface RevenueBarChartProps {
  data: DashboardCharts["revenueByDay"];
}

export const RevenueBarChart = ({ data }: RevenueBarChartProps) => {
  // Hoisted max so the .map no longer re-scans the full array on every row (O(n²) fix)
  const maxRevenue = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm rounded-none">
      <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Weekly Revenue</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4 font-medium">Sales for the last 7 days</p>
      {data.length === 0 ? (
        <EmptyState message="No sales recorded yet." className="py-10 text-center text-sm text-slate-500 dark:text-slate-400" />
      ) : (
        <div className="flex items-end justify-between gap-2 px-1 h-40">
          {data.map((day) => {
            const pct = Math.round((day.total / maxRevenue) * 100);
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300">
                  ${day.total > 0 ? day.total.toFixed(0) : "0"}
                </span>
                <div
                  className={`w-full rounded-t-lg transition-all ${day.total > 0 ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`}
                  style={{ height: `${pct}%` }}
                />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{day.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
