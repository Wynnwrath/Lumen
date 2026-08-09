import { EmptyState } from "../../ui/EmptyState";
import { Card } from "../../ui/Card";

interface TopProductsChartProps {
  data: { name: string; units: number }[];
}

const BAR_COLORS = ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"];

export const TopProductsChart = ({ data }: TopProductsChartProps) => {
  const maxUnits = data[0]?.units || 1;

  return (
    <Card variant="admin" className="p-5 sm:p-6">
      <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Top Selling Products</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-4 font-medium">Units sold by product</p>
      {data.length === 0 ? (
        <EmptyState message="No orders recorded yet." className="py-10 text-center text-sm text-slate-500 dark:text-slate-400" />
      ) : (
        <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
          {data.map((item, i) => {
            const pct = Math.round((item.units / maxUnits) * 100);
            const color = BAR_COLORS[Math.min(i, BAR_COLORS.length - 1)];
            return (
              <div key={item.name} className="flex items-center gap-3 group">
                <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 w-32 sm:w-40 truncate shrink-0">
                  {item.name}
                </span>
                <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                    style={{
                      width: `${pct}%`,
                      background: `linear-gradient(90deg, #10b981, ${color})`,
                    }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white w-10 text-right shrink-0">
                  {item.units}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
