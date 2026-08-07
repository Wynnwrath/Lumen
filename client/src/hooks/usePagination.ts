import { useMemo, useState, useEffect } from "react";

// Client-side pagination for admin lists. Keeps `page` valid when the items
// shrink (e.g. after a filter change) so you never land on an empty page.
export function usePagination<T>(items: T[], pageSize = 10) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const totalItems = items.length;

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const paginated = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return { page, setPage, totalPages, totalItems, start, end, paginated };
}
