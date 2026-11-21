import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

// A shareable selection kept in the URL (ARCHITECTURE.md §5.1): `?v=v0.9`, `?c=fundraising`,
// `?page=2`. Changing it uses `replace` (no history entry per click) unless `push` is asked for.
export function useSearchParamState(key: string): [string | null, (value: string | null, options?: { push?: boolean }) => void] {
  const [params, setParams] = useSearchParams();
  const value = params.get(key);

  const setValue = useCallback(
    (next: string | null, options?: { push?: boolean }) => {
      setParams(
        (current) => {
          const updated = new URLSearchParams(current);
          if (next === null || next === '') updated.delete(key);
          else updated.set(key, next);
          return updated;
        },
        { replace: !options?.push, preventScrollReset: true },
      );
    },
    [key, setParams],
  );

  return [value, setValue];
}

/** `?page=` as a 1-based page number (invalid or missing → 1). */
export function usePageParam(): number {
  const [value] = useSearchParamState('page');
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
