import { useEffect, useState, type ReactNode } from 'react';

// Campaign progress bar (template `barfiller`), markup verbatim:
//   <div class="donate_progressbar"><p>Donate</p><div class="barfiller">
//     <div class="tipWrap"><span class="tip" style="left: calc(65% - 25.6px)">65%</span></div>
//     <span class="fill" style="width: 65%"></span></div></div>
// The fill colour comes from impact100.css; the tip visibility and the 1s
// transitions from src/styles/app.css. Width/left are per-instance values, so
// they stay inline. Like the design (`grown` after 200 ms) the bar animates in.
const TIP_HALF_WIDTH = '25.6px'; // the design's tip offset
const GROW_DELAY_MS = 200;

export interface ProgressBarProps {
  /** the small label above the bar ("Donate" in the template) */
  label: ReactNode;
  /** 0–100 */
  percent: number;
  /** render already filled (no grow animation) */
  instant?: boolean;
  /** class of the label (campaign details: `founded`) */
  labelClassName?: string;
  /** content after the bar, inside `.donate_progressbar` (campaign details: the raised/goal line) */
  children?: ReactNode;
}

export function ProgressBar({ label, percent, instant = false, labelClassName, children }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  const [grown, setGrown] = useState(instant);

  useEffect(() => {
    if (instant) return undefined;
    const timer = setTimeout(() => setGrown(true), GROW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [instant]);

  return (
    <div className="donate_progressbar">
      <p className={labelClassName}>{label}</p>
      <div className="barfiller">
        <div className="tipWrap">
          <span className="tip" style={{ left: grown ? `calc(${pct}% - ${TIP_HALF_WIDTH})` : '0px' }}>
            {pct}%
          </span>
        </div>
        <span className="fill" style={{ width: grown ? `${pct}%` : '0%' }} />
      </div>
      {children}
    </div>
  );
}
