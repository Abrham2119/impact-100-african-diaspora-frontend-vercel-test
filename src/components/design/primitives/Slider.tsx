import type { ReactNode } from 'react';
import { cx } from '@/lib/classes';
import { useSlider, type SliderConfig, type SliderOptions } from '@/hooks/useSlider';

// The design's slick-style carousel (hero excluded), markup verbatim:
//   <div class="row testimonial_slider pt_35 slick-initialized slick-slider slick-dotted">
//     <div class="slick-list draggable"><div class="slick-track dc_track" style="opacity:1; transform: translate3d(-150%,0,0); transition: none;">
//       <div class="slick-slide slick-cloned" style="flex: 0 0 50%; width: 50%; max-width: 50%;">…</div>…
//     <ul class="slick-dots" role="tablist"><li class="slick-active" role="presentation"><button type="button" role="tab" aria-label="1 of 2" aria-selected="true">1</button></li>…
// Inline styles are required here: the track offset and slide widths are computed
// per render (same as the design script). No carousel library.
// Off-screen and cloned slides are `inert`, so keyboard/screen-reader users only
// meet the visible items; autoplay pauses on hover/focus and with reduced motion.
export interface SliderProps<Item> extends SliderOptions {
  items: Item[];
  getKey: (item: Item) => string;
  renderItem: (item: Item) => ReactNode;
  config: SliderConfig;
  /** the block's own classes, e.g. "row testimonial_slider pt_35" */
  className: string;
  /** accessible label of each dot, e.g. (1, 3) => "1 of 3" (from UiStrings) */
  dotLabel: (page: number, pages: number) => string;
}

export function Slider<Item>({ items, getKey, renderItem, config, className, dotLabel, ...options }: SliderProps<Item>) {
  const slider = useSlider(items.length, config, options);
  const withDots = options.dots !== false;
  if (items.length === 0) return null;

  return (
    <div
      className={cx(className, 'slick-initialized', 'slick-slider', withDots && 'slick-dotted')}
      onMouseEnter={slider.pause}
      onMouseLeave={slider.resume}
      onFocus={slider.pause}
      onBlur={slider.resume}
    >
      <div className="slick-list draggable">
        <div
          className="slick-track dc_track"
          style={{ opacity: 1, transform: `translate3d(${slider.offset}, 0px, 0px)`, transition: slider.transition }}
        >
          {slider.slides.map((slide) => {
            const item = items[slide.itemIndex];
            return (
              <div
                key={`${slide.key}-${getKey(item)}`}
                className={slide.className}
                style={{ flex: `0 0 ${slider.width}`, width: slider.width, maxWidth: slider.width }}
                inert={!slide.active || slide.cloned || undefined}
              >
                {renderItem(item)}
              </div>
            );
          })}
        </div>
      </div>
      {withDots && (
        <ul className="slick-dots" role="tablist">
          {slider.dots.map((dot) => (
            <li key={dot.page} className={cx(dot.active && 'slick-active')} role="presentation">
              <button type="button" role="tab" aria-label={dotLabel(dot.page, dot.pages)} aria-selected={dot.active} onClick={dot.go}>
                {dot.page}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
