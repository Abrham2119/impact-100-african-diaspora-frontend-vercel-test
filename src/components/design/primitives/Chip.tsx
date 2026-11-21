import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/classes';

// `.ix_chips > .ix_chip(.ix_on)` — toggle/filter chips.
//   <div class="ix_chips" role="toolbar" aria-label="Filter roles by area">
//     <button type="button" class="ix_chip ix_on" aria-pressed="true">All roles<span class="ix_count">19</span></button>…
export interface ChipGroupProps {
  /** accessible name; when given the group is announced as a toolbar (volunteer filters) */
  label?: string;
  className?: string;
  children: ReactNode;
}

export function ChipGroup({ label, className, children }: ChipGroupProps) {
  return (
    <div className={cx('ix_chips', className)} role={label ? 'toolbar' : undefined} aria-label={label}>
      {children}
    </div>
  );
}

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children' | 'type'> {
  on: boolean;
  /** trailing counter (`.ix_count`), e.g. number of roles */
  count?: number;
  children: ReactNode;
}

export function Chip({ on, count, children, ...rest }: ChipProps) {
  return (
    <button type="button" className={cx('ix_chip', on && 'ix_on')} aria-pressed={on} {...rest}>
      {children}
      {count !== undefined && <span className="ix_count">{count}</span>}
    </button>
  );
}
