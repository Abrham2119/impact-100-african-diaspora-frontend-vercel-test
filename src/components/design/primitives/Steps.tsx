import type { ReactNode } from 'react';
import { cx } from '@/lib/classes';

// Three ordered-list patterns from the design.

// `.ix_flow` — numbered step cards (`.ix_flow_2` = the compact two-column variant).
//   <ol class="ix_flow"><li><span class="ix_num">01</span><b>Launch the first grant cycle</b><p>…</p></li>…</ol>
export interface FlowStep {
  id: string;
  /** shown as given ("01" on the roadmap, "1" in the process flow) */
  num: ReactNode;
  title: ReactNode;
  text?: ReactNode;
  /** replaces the `.ix_num` circle (the dated roadmap shows an `.ix_badge` instead) */
  marker?: ReactNode;
}

export interface FlowStepsProps {
  steps: FlowStep[];
  variant?: 'default' | 'compact';
  className?: string;
}

export function FlowSteps({ steps, variant = 'default', className }: FlowStepsProps) {
  return (
    <ol className={cx('ix_flow', variant === 'compact' && 'ix_flow_2', className)}>
      {steps.map((step) => (
        <li key={step.id}>
          {step.marker ?? <span className="ix_num">{step.num}</span>}
          <b>{step.title}</b>
          {step.text !== undefined && <p>{step.text}</p>}
        </li>
      ))}
    </ol>
  );
}

// `.ix_steps` — wizard progress (join): done steps get `.ix_done`, the current one `.ix_now`.
//   <ol class="ix_steps" aria-label="Join progress"><li class="ix_now" aria-current="step">Level</li>…</ol>
export interface StepperProps {
  /** accessible name of the progress list */
  label: string;
  steps: ReactNode[];
  /** 1-based index of the current step */
  current: number;
  className?: string;
}

export function Stepper({ label, steps, current, className }: StepperProps) {
  return (
    <ol className={cx('ix_steps', className)} aria-label={label}>
      {steps.map((step, index) => {
        const n = index + 1;
        return (
          <li key={n} className={cx(n < current && 'ix_done', n === current && 'ix_now')} aria-current={n === current ? 'step' : undefined}>
            {step}
          </li>
        );
      })}
    </ol>
  );
}

// `.ix_timeline` — vertical process timeline; completed items get `.ix_done`.
//   <ol class="ix_timeline"><li class="ix_done"><b>Circulating</b><p>…</p></li><li><b>On ballot</b><p>…</p></li></ol>
export interface TimelineItem {
  id: string;
  title: ReactNode;
  text?: ReactNode;
  done?: boolean;
}

export function Timeline({ items, className, as: List = 'ol' }: { items: TimelineItem[]; className?: string; as?: 'ol' | 'ul' }) {
  return (
    <List className={cx('ix_timeline', className)}>
      {items.map((item) => (
        <li key={item.id} className={cx(item.done && 'ix_done')}>
          <b>{item.title}</b>
          {item.text !== undefined && <p>{item.text}</p>}
        </li>
      ))}
    </List>
  );
}
