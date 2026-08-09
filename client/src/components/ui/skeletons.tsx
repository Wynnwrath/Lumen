import { Skeleton } from "./Skeleton";
import { Card } from "./Card";

// Loading placeholders: product grid, list rows, admin lists, dashboard.

// Storefront product grid (used on the catalog + home pages).
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

// Storefront list rows (used on My Orders).
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

// Admin list page placeholder: one card with a header + row skeletons that
// mirror the mobile-card / desktop-table layout shared by every admin page.
export const AdminListSkeleton = ({ rows = 6 }: { rows?: number }) => (
  <Card variant="admin" className="overflow-hidden">
    <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-3 w-64 mt-2" />
    </div>
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  </Card>
);

// Dashboard placeholder: KPI card row + two chart blocks + a wide panel row.
export const DashboardSkeleton = () => (
  <div className="space-y-5 sm:space-y-6 w-full">
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 w-full">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} variant="admin" className="p-4 sm:p-6 flex flex-col justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-20 mt-3" />
          <Skeleton className="h-3 w-16 mt-2" />
        </Card>
      ))}
    </section>
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 w-full">
      <Card variant="admin" className="lg:col-span-7 p-5 sm:p-6 h-64" />
      <Card variant="admin" className="lg:col-span-5 p-5 sm:p-6 h-64" />
    </section>
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 w-full">
      <Card variant="admin" className="lg:col-span-8 p-5 sm:p-6 h-48" />
      <Card variant="admin" className="lg:col-span-4 p-5 sm:p-6 h-48" />
    </section>
  </div>
);
