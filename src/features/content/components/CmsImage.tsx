import type { CmsMedia } from '@/domain/entities/content.types';
import { cx } from '@/lib/classes';

// A CMS image in the design's markup (`img-fluid w-100` by default) with its CMS alt text.
// Width/height when known (no layout shift); the focal point becomes object-position — a
// justified inline style, because the value is data (ARCHITECTURE.md §7.3 point 5).
export interface CmsImageProps {
  media: CmsMedia;
  className?: string;
  /** below-the-fold images load lazily; the hero and first sections don't */
  lazy?: boolean;
}

export function CmsImage({ media, className = 'img-fluid w-100', lazy = true }: CmsImageProps) {
  return (
    <img
      src={media.url}
      alt={media.alt}
      className={cx(className)}
      width={media.width ?? undefined}
      height={media.height ?? undefined}
      loading={lazy ? 'lazy' : undefined}
      style={media.focal ? { objectPosition: `${media.focal.x * 100}% ${media.focal.y * 100}%` } : undefined}
    />
  );
}

/** Inline background override for sections whose default background is a design class. */
export const backgroundStyle = (media: CmsMedia | undefined) => (media ? { backgroundImage: `url(${media.url})` } : undefined);
