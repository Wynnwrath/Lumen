// Prev/Next pager used by list pages (10 per page on the product listing).
interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  start: number;
  end: number;
  onChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, totalItems, start, end, onChange }: PaginationProps) => (
  <div className="flex flex-col items-center gap-3 pt-6">
    <span className="text-xs font-semibold text-outline">
      Showing <span className="font-extrabold text-on-surface">{start}–{end}</span> of{" "}
      <span className="font-extrabold text-on-surface">{totalItems}</span> products
    </span>
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="px-3.5 py-2 rounded-xl bg-surface-container-lowest dark:bg-slate-800 text-on-surface text-xs font-bold border border-outline-variant/40 hover:border-secondary transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      <span className="text-xs font-bold text-on-surface">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="px-3.5 py-2 rounded-xl bg-surface-container-lowest dark:bg-slate-800 text-on-surface text-xs font-bold border border-outline-variant/40 hover:border-secondary transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  </div>
);
