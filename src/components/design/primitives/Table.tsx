import type { ReactNode } from 'react';
import { cx } from '@/lib/classes';

// `.ix_table_wrap > table.ix_table` — portal/admin data tables.
//   <div class="ix_table_wrap"><table class="ix_table"><thead><tr><th scope="col">Received</th>…</tr></thead>
//     <tbody><tr><td>Dec 1, 2026</td>…<td><span class="ix_badge ix_b_ok">Confirmed</span></td></tr></tbody></table></div>
export interface TableColumn<Row> {
  key: string;
  header: ReactNode;
  cell: (row: Row) => ReactNode;
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
}

export function Table<Row>({ columns, rows, rowKey, caption, empty, className }: TableProps<Row>) {
  return (
    <div className="ix_table_wrap">
      <table className={cx('ix_table', className)}>
        {caption !== undefined && <caption className="ix_sr">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.header}
              </th>
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
