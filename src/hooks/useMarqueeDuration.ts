import { useEffect, useRef, useState } from 'react';

// The design's marquee speed (index.dc.html componentDidMount): 300 ms after mount the first
// copy's width (+ its 25 px gap) is measured and the animation runs at 50 px per second.
const INITIAL = '40s';
const MEASURE_DELAY_MS = 300;
const GAP_PX = 25;
const PX_PER_SECOND = 50;

export function useMarqueeDuration<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [duration, setDuration] = useState(INITIAL);

  useEffect(() => {
    const timer = setTimeout(() => {
      const element = ref.current;
      if (element) setDuration(`${(element.offsetWidth + GAP_PX) / PX_PER_SECOND}s`);
    }, MEASURE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return { ref, duration };
}
