import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { EmptyState } from "../../../components/common/EmptyState";

interface TopProductsChartProps {
  data: { name: string; units: number }[];
}

export const TopProductsChart = ({ data }: TopProductsChartProps) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm rounded-none">
      <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Top Selling Products</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4 font-medium">Units sold by product</p>
      {data.length === 0 ? (
        <EmptyState text="No orders recorded yet." className="py-10 text-center text-sm text-slate-500 dark:text-slate-400" />
      ) : (
        <ResponsiveContainer width="100%" height={data.length * 52}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={140}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
              formatter={(value) => [`${value} units`, "Sold"]}
              contentStyle={{ borderRadius: 8, fontSize: 12, fontWeight: 600 }}
            />
            <Bar dataKey="units" fill="#10b981" radius={[0, 4, 4, 0]} barSize={14} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
