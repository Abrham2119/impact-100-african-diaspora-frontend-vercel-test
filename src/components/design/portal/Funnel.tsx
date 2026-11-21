import type { ReactNode } from 'react';

// `ul.ix_funnel` — the conversion funnel of the admin dashboard (admin.dc.html):
//   <ul class="ix_funnel"><li><b>Visits</b><i style="width:100%"></i><span>8,420</span></li>…</ul>
export function Funnel({ steps }: { steps: Array<{ key: string; label: ReactNode; widthPct: number; value: ReactNode }> }) {
  return (
    <ul className="ix_funnel">
      {steps.map((step) => (
        <li key={step.key}>
          <b>{step.label}</b>
          {/* the bar width is data, so it stays inline (as in the design) */}
          <i style={{ width: `${step.widthPct}%` }} />
          <span>{step.value}</span>
        </li>
      ))}
    </ul>
  );
}
