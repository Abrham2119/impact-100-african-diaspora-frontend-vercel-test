import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '@/lib/classes';

// Choice and summary patterns of the join / donate flows (impact100-ext.css), markup verbatim.

// `.ix_options > .ix_option(.ix_on)` — a large selectable option:
//   <div class="ix_options mt_30"><button type="button" class="ix_option ix_on" aria-pressed="true"><b>Incubator</b><span>$500 in the cycle</span><em class="ix_badge ix_b_info">Member</em></button>…
export function OptionGroup({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('ix_options', className)}>{children}</div>;
}

export interface OptionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'type' | 'children' | 'title'> {
  on: boolean;
  title: ReactNode;
  sub?: ReactNode;
  /** trailing badge (rendered by the caller, e.g. <Badge as="em">) */
  badge?: ReactNode;
}

export function OptionButton({ on, title, sub, badge, ...rest }: OptionButtonProps) {
  return (
    <button type="button" className={cx('ix_option', on && 'ix_on')} aria-pressed={on} {...rest}>
      <b>{title}</b>
      {sub !== undefined && <span>{sub}</span>}
      {badge}
    </button>
  );
}

// `.ix_check` — checkbox + label (consents):
//   <div class="ix_check"><input id="j_nl" type="checkbox"><label for="j_nl">Yes, send me …</label></div>
export const CheckField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { id: string; label: ReactNode }>(
  ({ id, label, ...rest }, ref) => (
    <div className="ix_check">
      <input ref={ref} id={id} type="checkbox" {...rest} />
      <label htmlFor={id}>{label}</label>
    </div>
  ),
);
CheckField.displayName = 'CheckField';

// `dl.ix_kv` — label / value pairs (join "Done", cancel gift):
//   <dl class="ix_kv mt_30"><dt>Level</dt><dd>Incubator · $500</dd>…</dl>
export function KeyValueList({ rows, className }: { rows: Array<{ key: string; label: ReactNode; value: ReactNode }>; className?: string }) {
  return (
    <dl className={cx('ix_kv', className)}>
      {rows.map((row) => (
        <div key={row.key} className="ixd_contents">
          <dt>{row.label}</dt>
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}
