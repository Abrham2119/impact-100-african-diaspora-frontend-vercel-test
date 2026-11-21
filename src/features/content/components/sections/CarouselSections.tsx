import { BRAND_ARROWS_MIN_WIDTH, CategoryItem, EventCard, SLIDER_CONFIGS, ServiceItem, Slider } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import { useViewportWidth } from '@/hooks/useViewportWidth';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import type { SectionData } from '../../schemas/defineSection';
import { campaignCategories, events, type categoryCarousel, type eventSlider, type logoStrip, type servicesSlider } from '../../schemas/sectionTypes';
import { useSectionEntries } from '../../hooks/useSectionEntries';
import { CmsImage } from '../CmsImage';
import { CollectionState, SectionHeadingRow, SectionPagination, toImage, useDotLabel } from './shared';

// The slick carousels of index.dc.html / about_us.dc.html, markup verbatim. Each slide wraps its
// item in the design's column (`<div class="col-xl-N" style="width:100%;display:inline-block">`).

// category_carousel — "Browse by Category" (C:campaign_categories); `layout: grid` is the paged
// /campaigns/category page (category.dc.html).
export function CategoryCarouselSection({ section }: { section: SectionData<typeof categoryCarousel> }) {
  const { toPath } = useLocale();
  const dotLabel = useDotLabel();
  const { entries, page, totalPages, isPending, isError, refetch } = useSectionEntries(campaignCategories, section.settings.source);
  const { kicker, title, lead } = section.fields;

  if (section.settings.layout === 'grid') {
    return (
      <section className="category_page mt_75">
        <div className="container">
          <CollectionState isPending={isPending} isError={isError} isEmpty={entries.length === 0} onRetry={() => void refetch()}>
            <div className="row">
              {entries.map((entry) => (
                <div key={entry.key} className="col-xl-2 col-6 col-sm-4 col-md-3">
                  <CategoryItem to={toPath(section.settings.href)} image={toImage(entry.media.image)} name={entry.fields.name} />
                </div>
              ))}
            </div>
            {section.settings.source.paginate && <SectionPagination page={page} totalPages={totalPages} />}
          </CollectionState>
        </div>
      </section>
    );
  }

  return (
    <section className="caregoey mt_100">
      <div className="container">
        <SectionHeadingRow kicker={kicker} title={title} lead={lead} />
        <CollectionState isPending={isPending} isError={isError} isEmpty={entries.length === 0} onRetry={() => void refetch()}>
          <Slider
            className="row category_slider mt_30"
            config={SLIDER_CONFIGS.categories}
            items={entries}
            getKey={(entry) => entry.key}
            dotLabel={dotLabel}
            renderItem={(entry) => (
              <div className="col-xl-2 ixd_slide_col">
                <CategoryItem to={toPath(section.settings.href)} image={toImage(entry.media.image)} name={entry.fields.name} />
              </div>
            )}
          />
        </CollectionState>
      </div>
    </section>
  );
}

// services_slider — "Where we sit" (items of the section)
export function ServicesSliderSection({ section }: { section: SectionData<typeof servicesSlider> }) {
  const { toPath } = useLocale();
  const t = useT('site');
  const dotLabel = useDotLabel();
  const { kicker, title, lead } = section.fields;
  const items = section.items.map((item, index) => ({ item, index }));

  return (
    <section className="services mt_100">
      <div className="container">
        <SectionHeadingRow kicker={kicker} title={title} lead={lead} />
        <Slider
          className="row mt_55 service_slider"
          config={SLIDER_CONFIGS.services}
          items={items}
          getKey={({ item }) => item.id}
          dotLabel={dotLabel}
          renderItem={({ item, index }) => (
            <div className="col-xl-3 ixd_slide_col">
              <ServiceItem
                index={index}
                to={toPath(item.settings.href)}
                icon={toImage(item.media.icon)}
                kicker={item.fields.kicker}
                title={item.fields.title}
                body={item.fields.body}
                readMore={t('readMore')}
              />
            </div>
          )}
        />
      </div>
    </section>
  );
}

// logo_strip — partner logos; no dots, arrows from 992 px
export function LogoStripSection({ section }: { section: SectionData<typeof logoStrip> }) {
  const t = useT('site');
  const dotLabel = useDotLabel();
  const withArrows = useViewportWidth() >= BRAND_ARROWS_MIN_WIDTH;

  return (
    <section className="brand mt_100">
      <div className="container">
        <Slider
          className="row brand_slider"
          config={SLIDER_CONFIGS.brands}
          dots={false}
          arrows={withArrows ? { previous: t('slider.previous'), next: t('slider.next') } : undefined}
          items={section.items}
          getKey={(item) => item.id}
          dotLabel={dotLabel}
          renderItem={(item) => (
            <div className="col-xl-2 ixd_slide_col">
              <div className="single_brand">
                <CmsImage media={item.media.logo} />
              </div>
            </div>
          )}
        />
      </div>
    </section>
  );
}

// event_slider — "Gather with us" (C:events; the cards link to /events/:slug); `layout: grid` is
// the paged /events list (event.dc.html).
export function EventSliderSection({ section }: { section: SectionData<typeof eventSlider> }) {
  const { toPath } = useLocale();
  const t = useT('site');
  const dotLabel = useDotLabel();
  const { entries, page, totalPages, isPending, isError, refetch } = useSectionEntries(events, section.settings.source);
  const { kicker, title, lead } = section.fields;
  const card = (entry: (typeof entries)[number], grid: boolean) => (
    <EventCard
      grid={grid}
      to={toPath(PATHS.public.eventDetail(entry.slug ?? entry.key))}
      image={toImage(entry.media.image)}
      date={entry.fields.date_label}
      place={entry.fields.place}
      title={entry.fields.title}
      summary={entry.fields.summary}
      cta={t('event.rsvp')}
    />
  );

  if (section.settings.layout === 'grid') {
    return (
      <section className="event_page mt_75">
        <div className="container">
          <SectionHeadingRow kicker={kicker} title={title} lead={lead} width="wide" />
          <div className="mt_50" />
          <CollectionState isPending={isPending} isError={isError} isEmpty={entries.length === 0} onRetry={() => void refetch()}>
            <div className="row">
              {entries.map((entry) => (
                <div key={entry.key} className="col-xl-4 col-md-6">
                  {card(entry, true)}
                </div>
              ))}
            </div>
            {section.settings.source.paginate && <SectionPagination page={page} totalPages={totalPages} />}
          </CollectionState>
        </div>
      </section>
    );
  }

  return (
    <section className="event mt_100">
      <div className="container">
        <SectionHeadingRow kicker={kicker} title={title} lead={lead} />
        <CollectionState isPending={isPending} isError={isError} isEmpty={entries.length === 0} onRetry={() => void refetch()}>
          <Slider
            className="row mt_30 event_slider"
            config={SLIDER_CONFIGS.events}
            items={entries}
            getKey={(entry) => entry.key}
            dotLabel={dotLabel}
            renderItem={(entry) => <div className="col-xl-4 ixd_slide_col">{card(entry, false)}</div>}
          />
        </CollectionState>
      </div>
    </section>
  );
}
