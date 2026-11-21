import type { ReactNode } from 'react';
import { cx } from '@/lib/classes';

// `.ix_table_wrap > table.ix_table` — portal/admin data tables.
//   <div class="ix_table_wrap"><table class="ix_table"><thead><tr><th scope="col">Received</th>…</tr></thead>
//     <tbody><tr><td>Dec 1, 2026</td>…<td><span class="ix_badge ix_b_ok">Confirmed</span></td></tr></tbody></table></div>
export interface TableColumn<Row> {
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
  /** makes the column sortable (admin lists): the value rows are ordered by */
  sortValue?: (row: Row) => string | number;
}

export interface TableSort {
  key: string;
  dir: 'asc' | 'desc';
}

export interface TableProps<Row> {
  columns: TableColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  /** visually hidden caption describing the table (screen readers) */
  caption?: ReactNode;
  /** rendered in a full-width row when `rows` is empty (design-styled empty state) */
  empty?: ReactNode;
  className?: string;
  /** the current sort and the handler of a header click (sortable columns only) */
  sort?: TableSort | null;
  onSort?: (key: string) => void;
}

// A sortable header is a button that looks like the header text (`ixd_th_sort`); the arrow shows
// only on the sorted column, so an unsorted table renders exactly as the design.
function Header<Row>({ column, sort, onSort }: { column: TableColumn<Row>; sort?: TableSort | null; onSort?: (key: string) => void }) {
  if (!column.sortValue || !onSort) return <th scope="col">{column.header}</th>;
  const active = sort?.key === column.key ? sort.dir : null;
  return (
    <th scope="col" aria-sort={active === 'asc' ? 'ascending' : active === 'desc' ? 'descending' : undefined}>
      <button type="button" className="ixd_th_sort" onClick={() => onSort(column.key)}>
        {column.header}
        {active && <i className={cx('far', active === 'asc' ? 'fa-arrow-up' : 'fa-arrow-down', 'ixd_sort_icon')} aria-hidden="true" />}
      </button>
    </th>
  );
}

export function Table<Row>({ columns, rows, rowKey, caption, empty, className, sort, onSort }: TableProps<Row>) {
  return (
    <div className="ix_table_wrap">
      <table className={cx('ix_table', className)}>
        {caption !== undefined && <caption className="ix_sr">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column) => (
              <Header key={column.key} column={column} sort={sort} onSort={onSort} />
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && empty !== undefined ? (
            <tr>
              <td colSpan={columns.length}>{empty}</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((column) => (
                  <td key={column.key}>{column.cell(row)}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
