import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { EmptyState } from "../../ui/EmptyState";
import { Card } from "../../ui/Card";
import type { DashboardCharts } from "../../../api/dashboard";

interface RevenueBarChartProps {
  data: DashboardCharts["revenueByDay"];
}

export const RevenueBarChart = ({ data }: RevenueBarChartProps) => (
  <Card variant="admin" className="lg:col-span-7 p-5 sm:p-6">
    <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Weekly Revenue</h2>
    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4 font-medium">Sales for the last 7 days</p>
    {data.length === 0 ? (
      <EmptyState message="No sales recorded yet." className="py-10 text-center text-sm text-slate-500 dark:text-slate-400" />
    ) : (
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ stroke: "rgba(148, 163, 184, 0.2)", strokeWidth: 1 }}
              formatter={(value) => [
                `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                "Revenue",
              ]}
              contentStyle={{ borderRadius: 8, fontSize: 12, fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              dot={{ fill: "#10b981", stroke: "#fff", strokeWidth: 2, r: 3 }}
              activeDot={{ fill: "#10b981", stroke: "#fff", strokeWidth: 2, r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )}
  </Card>
);
