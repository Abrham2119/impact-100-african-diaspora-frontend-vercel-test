import { cx } from '@/lib/classes';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import { useScrolledPast, useScrollProgress } from '@/hooks/useWindowScroll';

// Back-to-top button with the scroll-progress ring (every page, public and shells), markup
// verbatim from the snapshots. Design script: `active-progress` after 50 px, ring
// stroke-dashoffset = 307.919 − progress × 307.919, smooth scroll to the top on click.
// The ring's dash values are computed geometry, hence inline (ARCHITECTURE.md §1.1); the
// button's padding/border reset is the snapshot's own inline style.
const RING = 307.919;

export function ScrollProgressButton({ label }: { label: string }) {
  const visible = useScrolledPast(50);
  const progress = useScrollProgress();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <button
      type="button"
      className={cx('progress-wrap', visible && 'active-progress')}
      aria-label={label}
      style={{ padding: 0, border: 0 }}
      onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })}
    >
      <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102" aria-hidden="true">
        <path
          d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"
          style={{
            transition: 'stroke-dashoffset 10ms linear',
            strokeDasharray: `${RING}, ${RING}`,
            strokeDashoffset: RING - progress * RING,
          }}
        />
      </svg>
    </button>
  );
}
