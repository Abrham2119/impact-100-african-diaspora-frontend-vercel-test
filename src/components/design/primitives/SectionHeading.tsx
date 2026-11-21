import type { ReactNode } from 'react';
import { cx } from '@/lib/classes';

// `.section_heading` — orange kicker (h5, with bars) + title (h2), plus the
// optional `.ix_lead` intro paragraph that the design places right after the
// heading block (sibling, not child).
//   <div class="section_heading"><h5>Upcoming</h5><h2>Gather with us</h2></div><p class="ix_lead">…</p>
export interface SectionHeadingProps {
  kicker?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
}

export function SectionHeading({ kicker, title, lead, className }: SectionHeadingProps) {
  return (
    <>
      <div className={cx('section_heading', className)}>
        {kicker !== undefined && <h5>{kicker}</h5>}
        <h2>{title}</h2>
      </div>
      {lead !== undefined && <p className="ix_lead">{lead}</p>}
    </>
  );
}
