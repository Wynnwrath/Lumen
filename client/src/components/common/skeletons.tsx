import { Skeleton } from "./Skeleton";

// Loading placeholders: product grid and list rows.
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
