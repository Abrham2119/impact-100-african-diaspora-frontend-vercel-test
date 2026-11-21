import type { ReactNode } from 'react';
import { cx } from '@/lib/classes';
import { SectionHeading } from './SectionHeading';

// The centred heading row that opens most design sections:
//   <div class="row"><div class="col-xl-6 m-auto"><div class="section_heading"><h5>…</h5><h2>…</h2></div><p class="ix_lead">…</p></div></div>
// width: narrow = col-xl-6 · medium = col-xl-8 · wide = col-xl-8 col-lg-10 (the ix_card grids).
const WIDTH = {
  narrow: 'col-xl-6 m-auto',
  medium: 'col-xl-8 m-auto',
  wide: 'col-xl-8 col-lg-10 m-auto',
} as const;

export interface HeadingRowProps {
  kicker?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  width?: keyof typeof WIDTH;
  /** `ix_on_dark` heading on dark bands */
  onDark?: boolean;
  /** extra classes on the row, e.g. "ixd_mb50" */
  className?: string;
}

export function HeadingRow({ kicker, title, lead, width = 'narrow', onDark = false, className }: HeadingRowProps) {
  return (
    <div className={cx('row', className)}>
      <div className={WIDTH[width]}>
        <SectionHeading kicker={kicker} title={title} lead={lead} className={cx(onDark && 'ix_on_dark')} />
      </div>
    </div>
  );
}
