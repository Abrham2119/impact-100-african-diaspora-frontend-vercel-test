import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('resize', onChange);
  return () => window.removeEventListener('resize', onChange);
}

const getWidth = (): number => window.innerWidth;

// Current window.innerWidth, updated on resize. Used where the design's scripts
// branch on `vw` (responsive slider settings).
export function useViewportWidth(): number {
  return useSyncExternalStore(subscribe, getWidth, () => 1440);
}
