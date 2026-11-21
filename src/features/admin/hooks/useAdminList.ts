import { useCallback, useMemo } from 'react';
import type { TableColumn, TableSort } from '@/components/design';
import { useSearchParams } from 'react-router-dom';
import { usePageParam, useSearchParamState } from '@/hooks/useSearchParamState';

// Client-side search, filters, sorting and paging of an admin list, kept in the URL
// (`?q&<filter>&sort=<key>.<asc|desc>&page`, ARCHITECTURE §5.2) so a view can be shared and survives
// reloads. Pages hold 10 rows; a list that fits one page shows no pagination (as the design).
export const ADMIN_PAGE_SIZE = 10;

export interface AdminListOptions<Row> {
  columns: Array<TableColumn<Row>>;
  /** text the search box matches (lower-cased, contains) */
  searchText?: (row: Row) => string;
  /** URL filters: param name → predicate for its value ('' / missing = all) */
  filters?: Record<string, (row: Row, value: string) => boolean>;
  pageSize?: number;
}

export function useAdminList<Row>(rows: Row[] | undefined, { columns, searchText, filters = {}, pageSize = ADMIN_PAGE_SIZE }: AdminListOptions<Row>) {
  const [q, setQ] = useSearchParamState('q');
  const [sortParam, setSortParam] = useSearchParamState('sort');
  const [, setPage] = useSearchParamState('page');
  const page = usePageParam();
  const [params] = useSearchParams();
  const filterKeys = Object.keys(filters);
  const filterValues = filterKeys.map((key) => params.get(key) ?? '');

  const sort = useMemo<TableSort | null>(() => {
    const [key, dir] = (sortParam ?? '').split('.');
    return key && (dir === 'asc' || dir === 'desc') && columns.some((c) => c.key === key && c.sortValue) ? { key, dir } : null;
  }, [sortParam, columns]);

  const filtered = useMemo(() => {
    const needle = (q ?? '').trim().toLowerCase();
    let list = (rows ?? []).filter((row) => (!needle || !searchText ? true : searchText(row).toLowerCase().includes(needle)));
    filterKeys.forEach((key, i) => {
      const value = filterValues[i];
      if (value) list = list.filter((row) => filters[key](row, value));
    });
    const column = sort ? columns.find((c) => c.key === sort.key) : undefined;
    if (sort && column?.sortValue) {
      const by = column.sortValue;
      list = [...list].sort((a, b) => {
        const x = by(a);
        const y = by(b);
        const order = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { numeric: true });
        return sort.dir === 'asc' ? order : -order;
      });
    }
    return list;
    // `filters` / `searchText` are new functions each render; what they depend on is in the URL values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q, sort, columns, filterValues.join('\u0000')]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const pageRows = filtered.slice((current - 1) * pageSize, current * pageSize);

  /** header click: unsorted → ascending → descending → ascending… (page back to 1) */
  const onSort = useCallback(
    (key: string) => {
      const dir = sort?.key === key && sort.dir === 'asc' ? 'desc' : 'asc';
      setSortParam(`${key}.${dir}`);
      setPage(null);
    },
    [sort, setSortParam, setPage],
  );
  const onSearch = useCallback(
    (value: string) => {
      setQ(value);
      setPage(null);
    },
    [setQ, setPage],
  );

  return { rows: pageRows, total: filtered.length, page: current, totalPages, sort, onSort, query: q ?? '', onSearch };
}

/** A URL filter's value and setter (resets the page). */
export function useListFilter(key: string): [string, (value: string) => void] {
  const [value, setValue] = useSearchParamState(key);
  const [, setPage] = useSearchParamState('page');
  const set = useCallback(
    (next: string) => {
      setValue(next);
      setPage(null);
    },
    [setValue, setPage],
  );
  return [value ?? '', set];
}
