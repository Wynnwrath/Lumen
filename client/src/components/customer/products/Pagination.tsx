// Prev/Next pager used by list pages.
interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export const Pagination = ({ page, totalPages, onChange }: PaginationProps) => (
  <div className="flex items-center justify-center gap-3 pt-4">
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
);
