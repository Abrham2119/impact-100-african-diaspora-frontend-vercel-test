import { useEffect, useRef, type MouseEvent } from 'react';
import { CloseIcon, PlayIcon, PlusIcon } from './icons';
import type { CardImage } from './ContentCards';

// Photo / video gallery items and the photo lightbox (photo_gallery / video_gallery .dc.html),
// markup verbatim; venobox's inline styles are ixd_vbox_* classes.

export function GalleryItem({ href, image, label, kind, onOpen }: {
  href: string;
  image: CardImage;
  label: string;
  kind: 'photo' | 'video';
  onOpen?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const external = kind === 'video';
  return (
    <a
      className="gallery_item venobox vbox-item"
      href={href}
      onClick={onOpen}
      aria-label={label}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener' : undefined}
    >
      <img src={image.src} alt={image.alt} className="img-fluid w-100" loading="lazy" />
      <div className="gallery_item_overlay">
        <span>{kind === 'photo' ? <PlusIcon /> : <PlayIcon />}</span>
      </div>
    </a>
  );
}

export interface LightboxLabels {
  dialog: string;
  close: string;
  next: string;
  previous: string;
  nextText: string;
  previousText: string;
  count: string;
}

// Modal image viewer: Esc closes, ←/→ step, focus is trapped inside and returns to the
// opener on close (the design's dialog has role="dialog" aria-modal="true").
export function Lightbox({ image, labels, onClose, onNext, onPrevious }: {
  image: CardImage;
  labels: LightboxLabels;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButton.current?.focus();
    return () => opener?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowRight') onNext();
      else if (event.key === 'ArrowLeft') onPrevious();
      else if (event.key === 'Tab' && dialog.current) {
        const focusable = Array.from(dialog.current.querySelectorAll<HTMLElement>('button'));
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, onNext, onPrevious]);

  return (
    <div ref={dialog} className="vbox-overlay vbox-open ixd_vbox_overlay" role="dialog" aria-modal="true" aria-label={labels.dialog}>
      <div className="vbox-container ixd_vbox_container" onClick={onClose}>
        <div className="vbox-content ixd_vbox_content">
          <img className="vbox-figlio ixd_vbox_img" src={image.src} alt={image.alt} onClick={(event) => event.stopPropagation()} />
        </div>
      </div>
      <div className="vbox-left">
        <div className="vbox-num ixd_vbox_num">{labels.count}</div>
      </div>
      <button ref={closeButton} type="button" className="vbox-close ixd_vbox_close" aria-label={labels.close} onClick={onClose}>
        <CloseIcon />
      </button>
      <button type="button" className="vbox-next ixd_vbox_arrow" aria-label={labels.next} onClick={onNext}>
        <span>{labels.nextText}</span>
      </button>
      <button type="button" className="vbox-prev ixd_vbox_arrow" aria-label={labels.previous} onClick={onPrevious}>
        <span>{labels.previousText}</span>
      </button>
    </div>
  );
}
