import type { ReactNode } from 'react';

// `.ix_bar_row` — labelled horizontal bars (portal_result counts, portal_proposal rubric, admin
// membership by level, donations by area). Widths are computed from the data, so they stay inline.
//   <div class="ix_bar_row"><span>Yes</span><div class="ix_bar"><i class="ix_acc" style="width:72%"></i></div><em>44</em></div>
export interface BarRow {
  key: string;
  label: ReactNode;
  /** 0–100 */
  widthPct: number;
  value: ReactNode;
  /** accent fill (`ix_acc`); the design leaves some bars plain */
  accent?: boolean;
}

/** "72%" — whole numbers unless `decimals` (the proposal rubric draws "94.0%") */
export const barWidth = (pct: number, decimals?: number) => `${decimals === undefined ? Math.round(pct) : pct.toFixed(decimals)}%`;

export function BarRows({ rows, decimals }: { rows: BarRow[]; decimals?: number }) {
  return (
    <>
      {rows.map((row) => (
        <div key={row.key} className="ix_bar_row">
          <span>{row.label}</span>
          <div className="ix_bar">
            <i className={row.accent === false ? '' : 'ix_acc'} style={{ width: barWidth(Math.max(0, Math.min(100, row.widthPct)), decimals) }} />
          </div>
          <em>{row.value}</em>
        </div>
      ))}
    </>
  );
}
