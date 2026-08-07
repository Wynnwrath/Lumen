import { useCallback, useEffect, useRef, useState } from "react";

interface UseFetchOptions<T> {
  select?: (data: T) => T;
  enabled?: boolean;
}

interface UseFetchResult<T> {
  data: T | null;
  refresh: () => Promise<void>;
  loading: boolean;
  error: unknown;
}

export function useFetch<T>(fetcher: () => Promise<T>, options: UseFetchOptions<T> = {}): UseFetchResult<T> {
  const { select, enabled = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<unknown>(null);

  // Hold the latest fetcher/select in refs so `refresh` stays stable across
  // renders. Callers often pass inline arrows; without refs the effect would
  // re-run on every render and trigger an infinite refetch loop.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const selectRef = useRef(select);
  selectRef.current = select;

  const refresh = useCallback(async () => {
    try {
      const result = await fetcherRef.current();
      setData(selectRef.current ? selectRef.current(result) : result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refresh();
  }, [enabled, refresh]);

  return { data, refresh, loading, error };
}
