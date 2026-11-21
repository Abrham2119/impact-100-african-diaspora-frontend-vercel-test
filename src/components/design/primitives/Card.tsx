import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/lib/classes';

// `.ix_card` — white rounded card; `.ix_card_dark` (navy) and `.ix_card_soft`
// (cream) tones, `.ix_active` for the selected card, `.ix_kicker` label on top and
// `.ix_card_foot` actions row at the bottom.
//   <div class="ix_card ix_card_dark"><p class="ix_kicker">Voting member</p>…<div class="ix_card_foot">…</div></div>
export type CardTone = 'default' | 'dark' | 'soft';

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  tone?: CardTone;
  active?: boolean;
  kicker?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

export function Card({ tone = 'default', active = false, kicker, footer, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cx('ix_card', tone === 'dark' && 'ix_card_dark', tone === 'soft' && 'ix_card_soft', active && 'ix_active', className)}
      {...rest}
    >
      {kicker !== undefined && <p className="ix_kicker">{kicker}</p>}
      {children}
      {footer !== undefined && <div className="ix_card_foot">{footer}</div>}
    </div>
  );
}

// `.ix_note` — small muted note under a block.
export function Note({ className, children }: { className?: string; children: ReactNode }) {
  return <p className={cx('ix_note', className)}>{children}</p>;
}
