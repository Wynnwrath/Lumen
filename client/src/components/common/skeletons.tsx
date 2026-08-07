import { Skeleton } from "./Skeleton";
import { Icon } from "./Icon";

// Loading placeholders: product grid and list rows.

// Centered spinner used on admin pages instead of skeleton rows.
export const ListLoading = ({ label = "Loading..." }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 text-center shadow-xs rounded-none">
    <Icon name="loader" className="text-2xl animate-spin text-blue-600 dark:text-blue-400" />
    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span>
  </div>
);
export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl sm:rounded-2xl border border-outline-variant/30 overflow-hidden"
      >
        <Skeleton className="w-full aspect-square" />
        <div className="p-3 sm:p-4 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
    ))}
  </div>
);

export const ListRowsSkeleton = ({ rows = 6 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="bg-surface-container-lowest dark:bg-slate-800 rounded-xl border border-outline-variant/30 p-4 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-full" />
      </div>
    ))}
  </div>
);
