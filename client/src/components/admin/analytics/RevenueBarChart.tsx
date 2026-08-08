import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { EmptyState } from "../../ui/EmptyState";
import type { DashboardCharts } from "../../../api/dashboard";

interface RevenueBarChartProps {
  data: DashboardCharts["revenueByDay"];
}

export const RevenueBarChart = ({ data }: RevenueBarChartProps) => (
  <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm rounded-none">
    <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Weekly Revenue</h2>
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4 font-medium">Sales for the last 7 days</p>
    {data.length === 0 ? (
      <EmptyState message="No sales recorded yet." className="py-10 text-center text-sm text-slate-500 dark:text-slate-400" />
    ) : (
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
              formatter={(value) => [
                `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                "Revenue",
              ]}
              contentStyle={{ borderRadius: 8, fontSize: 12, fontWeight: 600 }}
            />
            <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} barSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )}
  </div>
);
