import type { ReactNode } from "react";

// Standard admin page toolbar: search on the left, action controls on the right.
interface AdminToolbarProps {
  search: ReactNode;
  actions?: ReactNode;
}

export const AdminToolbar = ({ search, actions }: AdminToolbarProps) => (
  <section className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800/90 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-none">
    <div className="flex-1 min-w-0">{search}</div>
    {actions && <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">{actions}</div>}
  </section>
);
