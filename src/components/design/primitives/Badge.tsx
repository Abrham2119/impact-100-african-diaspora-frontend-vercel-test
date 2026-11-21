import type { ReactNode } from 'react';
import { cx } from '@/lib/classes';

// `.ix_badge` status pill. Kinds map to the design's modifiers:
// ok → ix_b_ok (green) · warn → ix_b_warn · info → ix_b_info · accent → ix_b_accent ·
// bad → ix_b_bad · neutral → no modifier.
//   <span class="ix_badge ix_b_warn">Pending approval</span>
// The join level options render it as <em> (`as="em"`).
export type BadgeKind = 'neutral' | 'ok' | 'warn' | 'info' | 'accent' | 'bad';

export interface BadgeProps {
  kind?: BadgeKind;
  as?: 'span' | 'em';
  className?: string;
  children: ReactNode;
}

export function Badge({ kind = 'neutral', as: Tag = 'span', className, children }: BadgeProps) {
  return <Tag className={cx('ix_badge', kind !== 'neutral' && `ix_b_${kind}`, className)}>{children}</Tag>;
}
