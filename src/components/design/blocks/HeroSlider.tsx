import { useEffect, useId, useState, type ReactNode } from 'react';
import { cx } from '@/lib/classes';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

// Home hero: slick "fade" slider (index.dc.html `banner`), markup verbatim. Every slide is
// stacked in place (left: -100/n·i %) and cross-fades over 500 ms; autoplay every 4 s, paused on
// hover/focus and with reduced motion. Hidden slides are aria-hidden and inert.
// Per-slide positions/opacity are computed values, so they stay inline (as in the design).
export interface HeroSlide {
  key: string;
  kicker?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  actions?: ReactNode;
  /** CMS background; the design class `bg_banner_<n>` is the fallback */
  backgroundUrl?: string;
}

export interface HeroSliderProps {
  slides: HeroSlide[];
  autoplayMs: number;
  /** text on the rotating circle */
  circleText?: string;
  dotLabel: (page: number, pages: number) => string;
}

const FADE_MS = 500;

export function HeroSlider({ slides, autoplayMs, circleText, dotLabel }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const circleId = useId();
  const count = slides.length;

  useEffect(() => {
    if (paused || reducedMotion || count < 2 || autoplayMs <= 0) return undefined;
    const timer = setInterval(() => setCurrent((i) => (i + 1) % count), autoplayMs);
    return () => clearInterval(timer);
  }, [paused, reducedMotion, count, autoplayMs]);

  if (count === 0) return null;
  const width = `${100 / count}%`;

  return (
    <section className="banner">
      <div
        className="row banner_slider slick-initialized slick-slider slick-dotted"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className="slick-list draggable">
          <div className="slick-track" style={{ opacity: 1, width: `${count * 100}%` }}>
            {slides.map((slide, i) => {
              const on = i === current;
              return (
                <div
                  key={slide.key}
                  className={cx('slick-slide', on && 'slick-current slick-active')}
                  style={{
                    width,
                    position: 'relative',
                    left: `${(-100 / count) * i}%`,
                    top: 0,
                    zIndex: on ? 999 : 998,
                    opacity: on ? 1 : 0,
                    transition: `opacity ${FADE_MS}ms ease`,
                  }}
                  aria-hidden={!on}
                  inert={!on || undefined}
                >
                  <div>
                    <div className="col-12 ixd_slide_col">
                      <div
                        className={`banner_slider_item bg_banner_${(i % 4) + 1}`}
                        style={slide.backgroundUrl ? { backgroundImage: `url(${slide.backgroundUrl})` } : undefined}
                      >
                        <div className="banner_overlay">
                          <div className="container">
                            <div className="row">
                              <div className="col-xl-11 col-xxl-10 col-lg-12">
                                <div className="banner_text">
                                  {slide.kicker !== undefined && <h5>{slide.kicker}</h5>}
                                  <h1>{slide.title}</h1>
                                  {slide.body !== undefined && <p>{slide.body}</p>}
                                  {slide.actions !== undefined && <span className="ixd_hero_actions">{slide.actions}</span>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <ul className="slick-dots" role="tablist">
          {slides.map((slide, i) => (
            <li key={slide.key} className={cx(i === current && 'slick-active')} role="presentation">
              <button type="button" role="tab" aria-label={dotLabel(i + 1, count)} aria-selected={i === current} onClick={() => setCurrent(i)}>
                {i + 1}
              </button>
            </li>
          ))}
        </ul>
      </div>
      {circleText !== undefined && (
        <div className="circle_box">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <path id={circleId} d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
            </defs>
            <text>
              <textPath href={`#${circleId}`}>{circleText}</textPath>
            </text>
          </svg>
        </div>
      )}
    </section>
  );
}
