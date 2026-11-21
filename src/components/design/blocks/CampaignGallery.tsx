import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { cx } from '@/lib/classes';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { CardImage } from './ContentCards';

// Campaign details gallery (campaign_details.dc.html `large` / `small`): a large image slider and a
// 5-thumbnail strip centred on it (slick asNavFor + centerMode, infinite, 500 ms). Clicking a
// thumbnail brings it to the centre. Track offsets are computed, so they stay inline (as in the design).
const SPEED_MS = 500;

export interface CampaignGalleryProps {
  images: CardImage[];
  /** accessible name of each thumbnail, e.g. "Show image 3" */
  thumbLabel: (n: number) => string;
}

export function CampaignGallery({ images, thumbLabel }: CampaignGalleryProps) {
  const n = images.length;
  const [nav, setNav] = useState(n);
  const [moving, setMoving] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(settle.current), []);
  if (n === 0) return null;

  const pick = (index: number) => {
    const delta = index - nav;
    if (delta === 0) return;
    setNav(index);
    setMoving(!reducedMotion);
    clearTimeout(settle.current);
    settle.current = setTimeout(() => {
      setNav((v) => {
        let p = v;
        while (p >= 2 * n) p -= n;
        while (p < n) p += n;
        return p;
      });
      setMoving(false);
    }, SPEED_MS + 20);
  };
  const onKey = (event: KeyboardEvent<HTMLDivElement>, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      pick(index);
    }
  };
  const all = [...images, ...images, ...images];
  const transition = moving ? `transform ${SPEED_MS}ms ease` : 'none';
  const cloned = (i: number) => i < n || i >= 2 * n;

  return (
    <div className="product_details_img">
      <div className="row campaign_slider_large slick-initialized slick-slider">
        <div className="slick-list draggable">
          <div className="slick-track dc_track" style={{ opacity: 1, transform: `translate3d(-${nav * 100}%, 0px, 0px)`, transition }}>
            {all.map((image, i) => (
              <div
                key={i}
                className={cx('slick-slide', cloned(i) && 'slick-cloned', i === nav && 'slick-current slick-active')}
                style={{ flex: '0 0 100%', width: '100%', maxWidth: '100%' }}
                inert={i !== nav || undefined}
              >
                <div className="col-12 ixd_slide_col">
                  <div className="product_slider_large_item">
                    <img src={image.src} alt={image.alt} className="img-fluid" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="row campaign_slider_small slick-initialized slick-slider">
        <div className="slick-list draggable ixd_p0">
          <div className="slick-track dc_track" style={{ opacity: 1, transform: `translate3d(-${(nav - 2) * 20}%, 0px, 0px)`, transition }}>
            {all.map((image, i) => {
              const visible = i >= nav - 2 && i <= nav + 2;
              return (
                <div
                  key={i}
                  className={cx('slick-slide', cloned(i) && 'slick-cloned', visible && 'slick-active', i === nav && 'slick-current slick-center')}
                  style={{ flex: '0 0 20%', width: '20%', maxWidth: '20%' }}
                  role="button"
                  tabIndex={visible ? 0 : -1}
                  aria-label={thumbLabel((i % n) + 1)}
                  aria-current={i === nav || undefined}
                  inert={!visible || undefined}
                  onClick={() => pick(i)}
                  onKeyDown={(event) => onKey(event, i)}
                >
                  <div className="col-12 ixd_slide_col">
                    <div className="product_slider_small_item">
                      <img src={image.src} alt={image.alt} className="img-fluid" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
