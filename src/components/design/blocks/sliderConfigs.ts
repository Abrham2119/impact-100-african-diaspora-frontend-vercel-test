import type { SliderConfig } from '@/hooks/useSlider';

// The design's slick settings per carousel (index.dc.html / about_us.dc.html `this.CFG`), verbatim:
// base [show, scroll] and responsive [maxWidth, show, scroll|null] entries.
const bp = (maxWidth: number, show: number, scroll: number | null) => (scroll === null ? { maxWidth, show } : { maxWidth, show, scroll });

export const SLIDER_CONFIGS = {
  categories: { show: 6, scroll: 6, breakpoints: [bp(1400, 5, 5), bp(1200, 4, 4), bp(992, 4, 4), bp(768, 3, 3), bp(576, 2, 2)] },
  services: { show: 4, scroll: 4, breakpoints: [bp(1200, 3, null), bp(992, 2, 2), bp(768, 2, null), bp(576, 1, 1)] },
  brands: { show: 5, scroll: 5, breakpoints: [bp(1200, 4, 4), bp(992, 3, 3), bp(768, 2, 2), bp(576, 2, 2)] },
  events: { show: 3, scroll: 3, breakpoints: [bp(1200, 2, 2), bp(992, 2, 2), bp(768, 1, 1), bp(576, 1, 1)] },
  testimonials: { show: 2, scroll: 2, breakpoints: [bp(992, 1, 1), bp(768, 1, 1), bp(576, 1, 1)] },
  /** campaign_details related slider: 3/3; <1200 2/2, <992 2/2, <768 1/1, <576 1/1 */
  campaigns: { show: 3, scroll: 3, breakpoints: [bp(1200, 2, 2), bp(992, 2, 2), bp(768, 1, 1), bp(576, 1, 1)] },
  people: { show: 4, scroll: 4, breakpoints: [bp(1200, 3, null), bp(992, 2, null), bp(768, 2, 2), bp(576, 1, 1)] },
} satisfies Record<string, SliderConfig>;

/** The brand strip shows its arrows from this width up (design: `brandArrows: vw >= 992`). */
export const BRAND_ARROWS_MIN_WIDTH = 992;
