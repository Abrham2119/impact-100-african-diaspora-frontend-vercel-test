import type { ReactNode } from 'react';
import { cx } from '@/lib/classes';

// The portal/admin content panel (portal*.dc.html), markup verbatim:
//   <div class="dashboard_contant"><div class="dashboard_contant_top"><div class="dashboard_heading">
//     <h5>Your installments</h5><p>…</p></div>[right slot]</div><div class="ix_dash_body">…</div></div>
export function Panel({ title, lead, right, bodyClassName, className, children }: {
  title?: ReactNode;
  lead?: ReactNode;
  /** badge, toolbar or chips on the right of the heading */
  right?: ReactNode;
  bodyClassName?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cx('dashboard_contant', className)}>
      {title !== undefined && (
        <div className="dashboard_contant_top">
          <div className="dashboard_heading">
            <h5>{title}</h5>
            {lead !== undefined && <p>{lead}</p>}
          </div>
          {right}
        </div>
      )}
      <div className={cx('ix_dash_body', bodyClassName)}>{children}</div>
    </div>
  );
}

// A row of `.ix_stat` figures: <div class="row ix_gap"><div class="col-md-4"><div class="ix_stat"><p>Label</p><h3>$510</h3><span>note</span></div></div>…
export interface StatItem {
  key: string;
  label: ReactNode;
  value: ReactNode;
  note?: ReactNode;
}

export function StatRow({ items, columns = 'col-md-4', className }: { items: StatItem[]; columns?: string; className?: string }) {
  return (
    <div className={cx('row ix_gap', className)}>
      {items.map((item) => (
        <div key={item.key} className={columns}>
          <div className="ix_stat">
            <p>{item.label}</p>
            <h3>{item.value}</h3>
            {item.note !== undefined && <span>{item.note}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
