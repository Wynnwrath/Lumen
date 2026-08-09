import { Icon } from "../../ui/Icon";

// Compact admin pager: "Showing X–Y of Z" + prev/next, matching the admin
// slate style. Rendered only when there's more than one page.
interface AdminPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  start: number;
  end: number;
  onChange: (page: number) => void;
}

export const AdminPagination = ({ page, totalPages, totalItems, start, end, onChange }: AdminPaginationProps) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
      <span className="hidden sm:block text-xs font-semibold text-slate-500 dark:text-slate-400">
        Showing <span className="font-extrabold text-slate-900 dark:text-white">{start}–{end}</span> of{" "}
        <span className="font-extrabold text-slate-900 dark:text-white">{totalItems}</span>
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
        >
          <Icon name="chevron_left" className="text-sm" />
          Prev
        </button>
        <span className="text-xs font-bold text-slate-900 dark:text-white">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
        >
          Next
          <Icon name="chevron_right" className="text-sm" />
        </button>
      </div>
    </div>
  );
};
