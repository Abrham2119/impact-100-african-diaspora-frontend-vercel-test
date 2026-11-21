import type { ReactNode } from 'react';
import { cx } from '@/lib/classes';
import { Badge, type BadgeKind } from '../primitives/Badge';
import { ButtonRow } from '../primitives/Button';
import { Card } from '../primitives/Card';

// One `ix_card` of a card grid, in the four layouts the design uses (markup verbatim, inline
// styles as ixd_ classes):
//   icon  — <span class="ix_num"><i class="far fa-users"></i></span><h3 style="margin-top:16px">…</h3><p>…</p>   (purpose, facts)
//   num   — <span class="ix_num" [pill]>01 · Oct</span><h3 style="margin-top:16px">…</h3><p>…</p>               (cycle, model steps)
//   level — <p class="ix_kicker">…</p><h3 style="margin-top:8px">…</h3><h2 style="font-size:40px…">$250</h2><p>…</p>
//           [<div style="margin-top:12px"><span class="ix_badge ix_b_info">…</span></div>]<div class="ix_card_foot">…</div>
//   rich  — <p class="ix_kicker">…</p><h3 style="margin-top:8px">…</h3>… rich body …[<div class="ix_btn_row">…</div>]
export type IxCardVariant = 'icon' | 'num' | 'level' | 'rich';

export interface IxCardItemProps {
  variant: IxCardVariant;
  dark?: boolean;
  /** icon: Font Awesome class, e.g. "far fa-users" */
  icon?: string;
  /** num: the label in the circle / pill */
  num?: ReactNode;
  pill?: boolean;
  kicker?: ReactNode;
  title?: ReactNode;
  price?: ReactNode;
  /** rendered rich text (paragraphs, lists, tables) */
  body?: ReactNode;
  badge?: { label: ReactNode; kind: BadgeKind };
  /** buttons: in `ix_card_foot` (level) or an `ix_btn_row` (rich) */
  actions?: ReactNode;
}

export function IxCardItem({ variant, dark = false, icon, num, pill, kicker, title, price, body, badge, actions }: IxCardItemProps) {
  const tone = dark ? 'dark' : 'default';
  if (variant === 'icon' || variant === 'num') {
    return (
      <Card tone={tone}>
        <span className={cx('ix_num', pill && 'ixd_num_pill')}>{variant === 'icon' ? <i className={icon} aria-hidden="true" /> : num}</span>
        {title !== undefined && <h3 className="ixd_mt16">{title}</h3>}
        {body}
      </Card>
    );
  }
  if (variant === 'level') {
    return (
      <Card tone={tone} kicker={kicker} footer={actions}>
        <h3 className="ixd_mt8">{title}</h3>
        <h2 className={cx('ixd_price', dark && 'ixd_price_on_dark')}>{price}</h2>
        {body}
        {badge && (
          <div className="ixd_mt12">
            <Badge kind={badge.kind}>{badge.label}</Badge>
          </div>
        )}
      </Card>
    );
  }
  return (
    <Card tone={tone} kicker={kicker}>
      {title !== undefined && <h3 className="ixd_mt8">{title}</h3>}
      {body}
      {actions !== undefined && <ButtonRow>{actions}</ButtonRow>}
    </Card>
  );
}
