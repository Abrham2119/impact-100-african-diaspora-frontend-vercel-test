import { useMemo, type ReactNode } from 'react';
import { Accordion, ButtonLink, type AccordionItem } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import type { SectionData } from '../../schemas/defineSection';
import { committees, faqs, type faq } from '../../schemas/sectionTypes';
import { useSectionEntries } from '../../hooks/useSectionEntries';
import { CmsImage } from '../CmsImage';
import { RichText } from '../RichText';
import { CollectionState, SectionHeadingRow } from './shared';

// faq — the accordion of index / about_us / faq .dc.html (first item open, one at a time).
// Source C:faqs → question + answer; source C:committees (About) → name, size, duties and the
// "i'd like to help" link to that committee's card (`/about/committees?c=<key>`).
type Faq = SectionData<typeof faq>;

interface ListState {
  items: AccordionItem[];
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
}

function FaqLayout({ section, list }: { section: Faq; list: ListState }) {
  const { fields, media, settings } = section;
  const accordion = (
    <CollectionState isPending={list.isPending} isError={list.isError} isEmpty={list.items.length === 0} onRetry={list.onRetry}>
      <Accordion idPrefix={`faq-${section.id}`} items={list.items} />
    </CollectionState>
  );

  if (settings.layout === 'page') {
    return (
      <section className="faq_page mt_85">
        <div className="container">
          <div className="row">{accordion}</div>
        </div>
      </section>
    );
  }
  return (
    <section className="faq mt_100">
      <div className="container">
        <SectionHeadingRow kicker={fields.kicker} title={fields.title} lead={fields.lead} />
        <div className="row mt_40 justify-content-between">
          <div className="col-lg-5 col-xl-6">
            {media.image && (
              <div className="faq_img mt_15">
                <CmsImage media={media.image} />
              </div>
            )}
          </div>
          <div className="col-lg-7 col-xl-6">{accordion}</div>
        </div>
      </div>
    </section>
  );
}

function FaqEntries({ section }: { section: Faq }) {
  const { entries, isPending, isError, refetch } = useSectionEntries(faqs, section.settings.source);
  const items = useMemo(
    () => entries.map((entry) => ({ id: entry.key, question: entry.fields.question, answer: <RichText value={entry.fields.answer} /> })),
    [entries],
  );
  return <FaqLayout section={section} list={{ items, isPending, isError, onRetry: () => void refetch() }} />;
}

function CommitteeEntries({ section }: { section: Faq }) {
  const { toPath } = useLocale();
  const t = useT('site');
  const { entries, isPending, isError, refetch } = useSectionEntries(committees, section.settings.source);
  const items = useMemo(
    () =>
      entries.map((entry): AccordionItem => {
        const answer: ReactNode = (
          <>
            <p>
              <b>{t('committee.size', { seats: entry.fields.seats })}</b>
            </p>
            <RichText value={entry.fields.duties} />
            <ButtonLink size="sm" className="ixd_help_btn" to={toPath(`${PATHS.public.committees}?c=${encodeURIComponent(entry.key)}`)}>
              {t('committee.help')}
            </ButtonLink>
          </>
        );
        return { id: entry.key, question: entry.fields.name, answer };
      }),
    [entries, t, toPath],
  );
  return <FaqLayout section={section} list={{ items, isPending, isError, onRetry: () => void refetch() }} />;
}

export function FaqSection({ section }: { section: Faq }) {
  return section.settings.source.collection === committees.key ? <CommitteeEntries section={section} /> : <FaqEntries section={section} />;
}
