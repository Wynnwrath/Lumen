import { Icon } from "../../../components/common/Icon";
import { ProductImage } from "../../../components/common/ProductImage";
import type { Product } from "../../../types";

interface LowStockPanelProps {
  products: Product[];
  onRestock: (product: Product) => void;
}

export const LowStockPanel = ({ products, onRestock }: LowStockPanelProps) => {
  return (
    <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col justify-between transition-colors duration-200 rounded-none">
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Low Stock Alerts</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Items requiring urgent restocking (&lt; 5 units)</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
            <span id="low-stock-count">{products.length}</span> Items
          </span>
        </div>

        <div id="low-stock-container" className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-80 overflow-y-auto">
          {products.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
              <Icon name="check_circle" className="text-emerald-500 text-3xl mb-1 block" />
              All products are sufficiently stocked.
            </div>
          ) : (
            products.map((item) => {
              return (
                <div
                  key={item._id}
                  className="py-3 px-1 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <ProductImage
                      src={item.images && item.images.length > 0 ? item.images[0] : undefined}
                      alt={item.name}
                      className="w-10 h-10 rounded-md object-cover border border-slate-200 dark:border-slate-700/80 shrink-0 bg-slate-100 dark:bg-slate-800"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight" title={item.name}>
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 capitalize font-medium">
                          {item.category || "General"}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700 text-[10px]">•</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60">
                          {item.stock} left
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onRestock(item)}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-xs shrink-0"
                  >
                    Restock
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
