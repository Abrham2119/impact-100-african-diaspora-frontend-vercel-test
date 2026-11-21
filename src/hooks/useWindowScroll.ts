import { useSyncExternalStore } from 'react';

// Window scroll state for the design chrome (the pages' boilerplate `fix`, `progOn`, `prog`).
// useSyncExternalStore only re-renders when the selected snapshot changes, so the header
// re-renders when it crosses the sticky threshold, not on every scroll event.

function subscribe(onChange: () => void): () => void {
  window.addEventListener('scroll', onChange, { passive: true });
  window.addEventListener('resize', onChange);
  return () => {
    window.removeEventListener('scroll', onChange);
    window.removeEventListener('resize', onChange);
  };
}

const scrollY = (): number => window.scrollY || document.documentElement.scrollTop;

/** True once the page is scrolled by more than `threshold` px (default 0 → `menu_fix`). */
export function useScrolledPast(threshold = 0): boolean {
  return useSyncExternalStore(subscribe, () => scrollY() > threshold, () => false);
}

/** Scroll progress 0…1 of the whole document (the back-to-top ring). */
export function useScrollProgress(): number {
  return useSyncExternalStore(
    subscribe,
    () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? Math.min(1, scrollY() / max) : 0;
    },
    () => 0,
  );
}
