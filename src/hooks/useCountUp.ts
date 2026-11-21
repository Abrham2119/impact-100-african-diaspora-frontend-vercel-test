import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

// Port of the design's counter (index.dc.html `watch()`): when the element first enters the
// viewport, every value counts from 0 to its target over 2 s (linear, rounded). With reduced
// motion, or without IntersectionObserver, the final values show at once.
const DURATION_MS = 2000;

export function useCountUp<T extends Element>(targets: number[]) {
  const ref = useRef<T | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (done.current || !element) return undefined;
    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      done.current = true;
      setProgress(1);
      return undefined;
    }
    let frame = 0;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || done.current) return;
      done.current = true;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const f = Math.min(1, (now - start) / DURATION_MS);
        setProgress(f);
        if (f < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return { ref, values: targets.map((value) => Math.round(value * progress)) };
}
