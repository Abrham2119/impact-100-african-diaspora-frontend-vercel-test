import { PersonCard, SLIDER_CONFIGS, Slider, TestimonialCard } from '@/components/design';
import type { SectionData } from '../../schemas/defineSection';
import { leadership, testimonialEntries, volunteers, type people, type testimonials } from '../../schemas/sectionTypes';
import { useSectionEntries } from '../../hooks/useSectionEntries';
import { backgroundStyle } from '../CmsImage';
import { CollectionState, SectionHeadingRow, SectionPagination, toImage, useDotLabel } from './shared';

// testimonials and people (volunteers / leadership): a slider on home and about, a paged grid
// on their own pages (testimonial / volunteers .dc.html), markup verbatim.

export function TestimonialsSection({ section }: { section: SectionData<typeof testimonials> }) {
  const dotLabel = useDotLabel();
  const { entries, page, totalPages, isPending, isError, refetch } = useSectionEntries(testimonialEntries, section.settings.source);
  const { kicker, title, lead } = section.fields;
  const card = (entry: (typeof entries)[number]) => (
    <TestimonialCard
      rating={entry.data.rating}
      quote={entry.fields.quote}
      avatar={toImage(entry.media.avatar)}
      name={entry.fields.name}
      role={entry.fields.role}
    />
  );
  const state = { isPending, isError, isEmpty: entries.length === 0, onRetry: () => void refetch() };

  if (section.settings.layout === 'grid') {
    return (
      <section className="testimonial_page mt_75">
        <div className="container">
          <CollectionState {...state}>
            <div className="row">
              {entries.map((entry) => (
                <div key={entry.key} className="col-xl-6 col-md-6">
                  {card(entry)}
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
    <section className="testimonial mt_100">
      <div className="container">
        <SectionHeadingRow kicker={kicker} title={title} lead={lead} />
        <CollectionState {...state}>
          <Slider
            className="row testimonial_slider pt_35"
            config={SLIDER_CONFIGS.testimonials}
            items={entries}
            getKey={(entry) => entry.key}
            dotLabel={dotLabel}
            renderItem={(entry) => <div className="col-xl-6 ixd_slide_col">{card(entry)}</div>}
          />
        </CollectionState>
      </div>
    </section>
  );
}

export function PeopleSection({ section }: { section: SectionData<typeof people> }) {
  const dotLabel = useDotLabel();
  const { source, layout } = section.settings;
  const type = source.collection === leadership.key ? leadership : volunteers;
  const { entries, page, totalPages, isPending, isError, refetch } = useSectionEntries(type, source);
  const { kicker, title, lead } = section.fields;
  const state = { isPending, isError, isEmpty: entries.length === 0, onRetry: () => void refetch() };

  if (layout === 'grid') {
    return (
      <section className="volunteer_page mt_75">
        <div className="container">
          <CollectionState {...state}>
            <div className="row">
              {entries.map((entry) => (
                <div key={entry.key} className="col-xl-3">
                  <PersonCard grid photo={toImage(entry.media.photo)} name={entry.fields.name} role={entry.fields.role} />
                </div>
              ))}
            </div>
            {source.paginate && <SectionPagination page={page} totalPages={totalPages} />}
          </CollectionState>
        </div>
      </section>
    );
  }
  return (
    <section className="volunteer mt_100 pt_100 pb_100 bg_volunteer" style={backgroundStyle(section.media.background)}>
      <div className="container">
        <SectionHeadingRow kicker={kicker} title={title} lead={lead} />
        <CollectionState {...state}>
          <Slider
            className="row volunteer_slider mt_30"
            config={SLIDER_CONFIGS.people}
            items={entries}
            getKey={(entry) => entry.key}
            dotLabel={dotLabel}
            renderItem={(entry) => (
              <div className="col-xl-3 ixd_slide_col">
                <PersonCard photo={toImage(entry.media.photo)} name={entry.fields.name} role={entry.fields.role} />
              </div>
            )}
          />
        </CollectionState>
      </div>
    </section>
  );
}
