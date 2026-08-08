import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { EmptyState } from "../../ui/EmptyState";
import type { DashboardCharts } from "../../../api/dashboard";

interface OrdersByStatusListProps {
  data: DashboardCharts["ordersByStatus"];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  processing: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#10b981",
  completed: "#10b981",
  cancelled: "#ef4444",
};

const FALLBACK_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

export const OrdersByStatusList = ({ data }: OrdersByStatusListProps) => {
  const total = data.reduce((sum, x) => sum + x.count, 0);

  return (
    <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm rounded-none">
      <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Orders by Status</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4 font-medium">Current order distribution</p>
      {data.length === 0 ? (
        <EmptyState message="No orders recorded yet." className="py-10 text-center text-sm text-slate-500 dark:text-slate-400" />
      ) : (
        <div className="flex items-center gap-4">
          <div className="h-44 w-44 shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  dataKey="count"
                  nameKey="status"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.status}
                      fill={STATUS_COLORS[entry.status.toLowerCase()] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} orders`, name]}
                  contentStyle={{ borderRadius: 8, fontSize: 12, fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{total}</span>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Total</span>
            </div>
          </div>
          <div className="space-y-1.5 min-w-0">
            {data.map((s) => {
              const color =
                STATUS_COLORS[s.status.toLowerCase()] || FALLBACK_COLORS[data.indexOf(s) % FALLBACK_COLORS.length];
              return (
                <div key={s.status} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="font-bold text-slate-900 dark:text-slate-100 capitalize">{s.status}</span>
                  <span className="font-mono font-semibold text-slate-500 dark:text-slate-400 ml-auto">{s.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
