import type { ReactNode } from 'react';
import { cx } from '@/lib/classes';

// `.ix_result` feedback box: ok (green), wait (pending), bad (error).
//   <div class="ix_result ix_ok"><h4>Thanks — your story is with an editor</h4><p>…</p></div>
// Errors are announced immediately (role="alert"); the others politely (role="status").
export type ResultKind = 'ok' | 'wait' | 'bad';

export interface ResultBoxProps {
  kind: ResultKind;
  title: ReactNode;
  /** paragraph text under the title */
  children?: ReactNode;
  /** content after the paragraph, inside the box (e.g. a button row) */
  extra?: ReactNode;
  className?: string;
}

export function ResultBox({ kind, title, children, extra, className }: ResultBoxProps) {
  return (
    <div className={cx('ix_result', `ix_${kind}`, className)} role={kind === 'bad' ? 'alert' : 'status'}>
      <h4>{title}</h4>
      {children !== undefined && <p>{children}</p>}
      {extra}
    </div>
  );
}
