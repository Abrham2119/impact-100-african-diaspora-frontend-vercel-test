import { useCallback, useState, type MouseEvent } from 'react';
import { DonorCard, GalleryItem, Lightbox } from '@/components/design';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatMoney } from '@/lib/format';
import type { SectionData } from '../../schemas/defineSection';
import { donors, photos, videos, type donorList, type photoGallery, type videoGallery } from '../../schemas/sectionTypes';
import { useSectionEntries } from '../../hooks/useSectionEntries';
import { CollectionState, SectionPagination, toImage } from './shared';

// The paged grids of the About menu (donot_list / photo_gallery / video_gallery .dc.html),
// markup verbatim, "01 02 03" pagination via `?page=`.

export function DonorListSection({ section }: { section: SectionData<typeof donorList> }) {
  const { locale } = useLocale();
  const { source } = section.settings;
  const { entries, page, totalPages, isPending, isError, refetch } = useSectionEntries(donors, source);
  return (
    <section className="donor_list mt_75">
      <div className="container">
        <CollectionState isPending={isPending} isError={isError} isEmpty={entries.length === 0} onRetry={() => void refetch()}>
          <div className="row">
            {entries.map((entry) => (
              <div key={entry.key} className="col-xl-4 col-md-6">
                <DonorCard amount={formatMoney(entry.data.amount_cents, locale)} name={entry.fields.name} location={entry.fields.location} />
              </div>
            ))}
          </div>
          {source.paginate && <SectionPagination page={page} totalPages={totalPages} />}
        </CollectionState>
      </div>
    </section>
  );
}

// photo_gallery — photos open in the lightbox (prev/next wrap around, "n/total" of this page)
export function PhotoGallerySection({ section }: { section: SectionData<typeof photoGallery> }) {
  const t = useT('site');
  const { source } = section.settings;
  const { entries, page, totalPages, isPending, isError, refetch } = useSectionEntries(photos, source);
  const [open, setOpen] = useState(-1);
  const count = entries.length;
  const close = useCallback(() => setOpen(-1), []);
  const next = useCallback(() => setOpen((i) => (i + 1) % count), [count]);
  const previous = useCallback(() => setOpen((i) => (i - 1 + count) % count), [count]);
  const current = open >= 0 ? entries[open] : undefined;

  return (
    <section className="photo_gallery mt_75">
      <div className="container">
        <CollectionState isPending={isPending} isError={isError} isEmpty={count === 0} onRetry={() => void refetch()}>
          <div className="row">
            {entries.map((entry, i) => (
              <div key={entry.key} className="col-lg-4 col-sm-6">
                <GalleryItem
                  kind="photo"
                  href={entry.media.image.url}
                  image={toImage(entry.media.image)}
                  label={t('gallery.open', { n: i + 1 })}
                  onOpen={(event: MouseEvent<HTMLAnchorElement>) => {
                    event.preventDefault();
                    setOpen(i);
                  }}
                />
              </div>
            ))}
          </div>
          {source.paginate && <SectionPagination page={page} totalPages={totalPages} />}
        </CollectionState>
      </div>
      {current && (
        <Lightbox
          image={toImage(current.media.image)}
          onClose={close}
          onNext={next}
          onPrevious={previous}
          labels={{
            dialog: t('lightbox.label'),
            close: t('lightbox.close'),
            next: t('lightbox.next'),
            previous: t('lightbox.previous'),
            nextText: t('lightbox.nextText'),
            previousText: t('lightbox.previousText'),
            count: t('lightbox.count', { n: open + 1, total: count }),
          }}
        />
      )}
    </section>
  );
}

// video_gallery — each thumbnail opens the video (external, new tab)
export function VideoGallerySection({ section }: { section: SectionData<typeof videoGallery> }) {
  const t = useT('site');
  const { source } = section.settings;
  const { entries, page, totalPages, isPending, isError, refetch } = useSectionEntries(videos, source);
  return (
    <section className="video_gallery mt_75">
      <div className="container">
        <CollectionState isPending={isPending} isError={isError} isEmpty={entries.length === 0} onRetry={() => void refetch()}>
          <div className="row">
            {entries.map((entry) => (
              <div key={entry.key} className="col-lg-4 col-sm-6">
                <GalleryItem kind="video" href={entry.data.url} image={toImage(entry.media.thumbnail)} label={t('video.play')} />
              </div>
            ))}
          </div>
          {source.paginate && <SectionPagination page={page} totalPages={totalPages} />}
        </CollectionState>
      </div>
    </section>
  );
}
