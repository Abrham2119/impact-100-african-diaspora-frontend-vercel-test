import type { ReactNode } from 'react';
import { Badge } from '../primitives/Badge';
import { Card } from '../primitives/Card';

// A committee card of /about/committees (committees.dc.html), markup verbatim:
//   <div class="ix_card [ix_active]"><div class="ix_role_top"><h4>Fundraising</h4><span class="ix_badge">3–5</span></div>
//     <ul class="ix_list">…</ul> + the "i'd like to help" foot, the interest form or the "Sent" result.
export interface CommitteeCardProps {
  name: ReactNode;
  seats: ReactNode;
  active: boolean;
  /** the duties (rendered rich text: `ul.ix_list`) */
  duties: ReactNode;
  /** foot button, form or result */
  children: ReactNode;
}

export function CommitteeCard({ name, seats, active, duties, children }: CommitteeCardProps) {
  return (
    <Card active={active}>
      <div className="ix_role_top">
        <h4>{name}</h4>
        <Badge>{seats}</Badge>
      </div>
      {duties}
      {children}
    </Card>
  );
}
