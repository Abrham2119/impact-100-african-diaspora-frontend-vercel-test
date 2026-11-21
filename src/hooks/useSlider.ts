import { useCallback, useEffect, useRef, useState } from 'react';
import { useViewportWidth } from '@/hooks/useViewportWidth';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// Port of the design's slick replacement (pages/index.dc.html: settings(), move(),
// slider()). The track holds three copies of the items (clone · originals · clone);
// `pos` starts on the first original and is normalised back into the middle copy
// after every animated move, which gives an infinite loop without visible jumps.

/** slick `responsive` entry: applies while the window is narrower than `maxWidth`. */
export interface SliderBreakpoint {
  maxWidth: number;
  show: number;
  /** omitted → the base `scroll` value (the design's `null`) */
  scroll?: number;
}

export interface SliderConfig {
  show: number;
  scroll: number;
  breakpoints?: SliderBreakpoint[];
}

export interface SliderOptions {
  /** design: AUTOPLAY = 4000 */
  autoplayMs?: number;
  /** design: SPEED = 500 */
  speedMs?: number;
  /** false → no dots (the design's brand strip) */
  dots?: boolean;
}

export interface SliderSlide {
  key: string;
  itemIndex: number;
  className: string;
  cloned: boolean;
  active: boolean;
}

export interface SliderDot {
  page: number;
  pages: number;
  active: boolean;
  go: () => void;
}

export interface SliderState {
  slides: SliderSlide[];
  dots: SliderDot[];
  /** slide width, e.g. "25%" */
  width: string;
  /** track translateX, e.g. "-100%" */
  offset: string;
  transition: string;
  prev: () => void;
  next: () => void;
  pause: () => void;
  resume: () => void;
}

const DEFAULT_AUTOPLAY_MS = 4000;
const DEFAULT_SPEED_MS = 500;

// slick (mobileFirst: false): the smallest breakpoint above the window width wins.
export function resolveSliderSettings(config: SliderConfig, viewportWidth: number) {
  let hit: SliderBreakpoint | undefined;
  for (const bp of config.breakpoints ?? []) {
    if (viewportWidth < bp.maxWidth && (!hit || bp.maxWidth < hit.maxWidth)) hit = bp;
  }
  return { show: hit ? hit.show : config.show, scroll: hit?.scroll ?? config.scroll };
}

function normalise(pos: number, count: number): number {
  let p = pos;
  while (p >= 2 * count) p -= count;
  while (p < count) p += count;
  return p;
}

export function useSlider(count: number, config: SliderConfig, options: SliderOptions = {}): SliderState {
  const { autoplayMs = DEFAULT_AUTOPLAY_MS, speedMs = DEFAULT_SPEED_MS, dots: withDots = true } = options;
  const viewportWidth = useViewportWidth();
  const reducedMotion = usePrefersReducedMotion();
  const { show, scroll } = resolveSliderSettings(config, viewportWidth);

  const [pos, setPos] = useState(count);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Re-anchor when the number of items changes (e.g. data arrives).
  useEffect(() => {
    setPos(count);
  }, [count]);

  const move = useCallback(
    (delta: number) => {
      if (count === 0) return;
      setPos((p) => p + delta);
      setAnimating(true);
      clearTimeout(settleTimer.current);
      settleTimer.current = setTimeout(() => {
        setPos((p) => normalise(p, count));
        setAnimating(false);
      }, speedMs + 20);
    },
    [count, speedMs],
  );

  useEffect(() => () => clearTimeout(settleTimer.current), []);

  useEffect(() => {
    if (paused || reducedMotion || count === 0 || autoplayMs <= 0) return undefined;
    const timer = setInterval(() => move(scroll), autoplayMs);
    return () => clearInterval(timer);
  }, [paused, reducedMotion, count, autoplayMs, move, scroll]);

  const slides: SliderSlide[] = [];
  for (let i = 0; i < count * 3; i += 1) {
    const cloned = i < count || i >= 2 * count;
    const active = i >= pos && i < pos + show;
    const className =
      'slick-slide' + (cloned ? ' slick-cloned' : '') + (active ? ' slick-active' : '') + (i === pos ? ' slick-current' : '');
    slides.push({ key: String(i), itemIndex: i % count, className, cloned, active });
  }

  const dots: SliderDot[] = [];
  if (withDots && count > 0) {
    const rel = (((pos - count) % count) + count) % count;
    const pages = Math.ceil(count / scroll);
    const current = Math.min(pages - 1, Math.floor(rel / scroll));
    for (let page = 0; page < pages; page += 1) {
      dots.push({
        page: page + 1,
        pages,
        active: page === current,
        go: () => {
          const delta = page * scroll - rel;
          if (delta !== 0) move(delta);
        },
      });
    }
  }

  return {
    slides,
    dots,
    width: `${100 / show}%`,
    offset: `-${(pos * 100) / show}%`,
    transition: animating ? `transform ${speedMs}ms ease` : 'none',
    prev: () => move(-scroll),
    next: () => move(scroll),
    pause: () => setPaused(true),
    resume: () => setPaused(false),
  };
}
