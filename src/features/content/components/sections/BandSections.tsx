import type { ReactNode } from 'react';
import { ButtonRow, Card, CounterItem, ResultBox } from '@/components/design';
import { submissionStorage } from '@/infrastructure/storage/submission.storage';
import { useCountUp } from '@/hooks/useCountUp';
import { useMarqueeDuration } from '@/hooks/useMarqueeDuration';
import { cx } from '@/lib/classes';
import type { SectionData } from '../../schemas/defineSection';
import { portfolios, type band, type counterBand, type ctaBand, type statusCard, type textMarquee } from '../../schemas/sectionTypes';
import { useSectionEntries } from '../../hooks/useSectionEntries';
import { CmsButton, CmsButtons } from '../CmsButton';
import { backgroundStyle } from '../CmsImage';
import { CollectionState, SectionHeadingRow } from './shared';

// Full-width bands of index / about_us / our_model / newsletter pages, markup verbatim.

// band — `.ix_band` (home "Powered by WAZi" 8/4, our-model "Where the money goes" 7/5)
const SPLIT = {
  '8_4': { text: 'col-lg-8', actions: 'col-lg-4', body: 'ixd_mt12' },
  '7_5': { text: 'col-lg-7', actions: 'col-lg-5', body: 'ixd_mt14' },
} as const;
const TITLE_SIZE = { '40': 'ixd_band_title', '38': 'ixd_band_title_38' } as const;

export function BandSection({ section }: { section: SectionData<typeof band> }) {
  const { fields } = section;
  const split = SPLIT[section.settings.split];
  return (
    <section className="mt_100">
      <div className="container">
        <div className="ix_band">
          <div className="row ix_gap align-items-center">
            <div className={split.text}>
              {fields.kicker !== undefined && <p className="ix_kicker">{fields.kicker}</p>}
              <h2 className={cx(TITLE_SIZE[section.settings.title_size], fields.kicker !== undefined && 'ixd_mt8')}>{fields.title}</h2>
              <p className={cx(split.body, 'ixd_band_text')}>{fields.body}</p>
            </div>
            <div className={split.actions}>
              {fields.actions && (
                <ButtonRow className="ixd_row_end">
                  <CmsButtons links={fields.actions} />
                </ButtonRow>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// cta_band — `.become_volunteer` (home volunteer call, about sponsors)
export function CtaBandSection({ section }: { section: SectionData<typeof ctaBand> }) {
  const { fields, media } = section;
  return (
    <section className="become_volunteer mt_100">
      <div className="container">
        <div className="become_volunteer_bg bg_become" style={backgroundStyle(media.background)}>
          <div className="row">
            <div className="col-xl-8">
              <div className="become_volunteer_text">
                {fields.kicker !== undefined && <h5 className="ix_kicker ixd_kicker_on_dark">{fields.kicker}</h5>}
                <h2>{fields.title}</h2>
                <p>{fields.body}</p>
                <CmsButton link={fields.cta} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// text_marquee — the values ticker; the second copy is decorative (aria-hidden)
export function TextMarqueeSection({ section }: { section: SectionData<typeof textMarquee> }) {
  const { ref, duration } = useMarqueeDuration<HTMLDivElement>();
  const list = (
    <ul>
      {section.items.map((item) => (
        <li key={item.id}>{item.fields.text}</li>
      ))}
    </ul>
  );
  return (
    <section className="text_slider">
      <div className="marquee_animi ixd_overflow_hidden">
        {/* the duration is measured from the rendered width (design script), so it stays inline */}
        <div className="dc_marquee" style={{ animationDuration: duration }}>
          <div className="js-marquee ixd_marquee_copy" ref={ref}>
            {list}
          </div>
          <div className="js-marquee ixd_marquee_copy" aria-hidden="true">
            {list}
          </div>
        </div>
      </div>
    </section>
  );
}

// counter_band — `.counter_section`: count-up figures (home) or the four portfolios (about)
type Counter = SectionData<typeof counterBand>;

function CounterShell({ section, children }: { section: Counter; children: ReactNode }) {
  return (
    <div className="counter_overlay pt_100 pb_100">
      <div className="container">
        <SectionHeadingRow
          kicker={section.fields.kicker}
          title={section.fields.title}
          lead={section.fields.lead}
          width="medium"
          onDark
          className="ixd_mb50"
        />
        <div className="row">{children}</div>
      </div>
    </div>
  );
}

function CountUpBand({ section }: { section: Counter }) {
  const { ref, values } = useCountUp<HTMLElement>(section.items.map((item) => item.settings.value));
  return (
    <section className="counter_section mt_100 bg_counter" ref={ref} style={backgroundStyle(section.media.background)}>
      <CounterShell section={section}>
        {section.items.map((item, i) => (
          <div key={item.id} className="col-md-3 col-6">
            <CounterItem icon={item.settings.icon} value={values[i]} label={item.fields.label} />
          </div>
        ))}
      </CounterShell>
    </section>
  );
}

function PortfolioBand({ section }: { section: Counter }) {
  const source = section.settings.source ?? { collection: portfolios.key };
  const { entries, isPending, isError, refetch } = useSectionEntries(portfolios, source);
  return (
    <section className="counter_section mt_100 bg_counter" style={backgroundStyle(section.media.background)}>
      <CounterShell section={section}>
        <CollectionState isPending={isPending} isError={isError} isEmpty={entries.length === 0} onRetry={() => void refetch()}>
          {entries.map((entry, i) => (
            <div key={entry.key} className="col-md-3 col-6">
              <CounterItem
                icon={entry.data.icon}
                value={String(i + 1).padStart(2, '0')}
                label={
                  <>
                    <b>{entry.fields.name}</b>
                    <br />
                    {entry.fields.flagship}
                  </>
                }
              />
            </div>
          ))}
        </CollectionState>
      </CounterShell>
    </section>
  );
}

export function CounterBandSection({ section }: { section: Counter }) {
  return section.settings.variant === 'portfolio' ? <PortfolioBand section={section} /> : <CountUpBand section={section} />;
}

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (match, name: string) => values[name] ?? match);

// status_card — newsletter confirmed / unsubscribed and the thanks pages. With `summary_key` the
// form's last submission fills the result box ("$100 · monthly · Diaspora Engagement · Kenya").
export function StatusCardSection({ section }: { section: SectionData<typeof statusCard> }) {
  const { fields, settings } = section;
  const summary = settings.summary_key ? submissionStorage.read(settings.summary_key) : null;
  return (
    <section className="mt_100">
      <div className="container">
        <div className="row">
          <div className="col-xl-7 col-lg-9 m-auto">
            <Card className="ixd_status_card">
              <div className="ix_num ixd_num_xl">
                <i className={settings.icon} aria-hidden="true" />
              </div>
              <h2 className="ixd_title_38">{fields.title}</h2>
              <p className="ixd_band_text ixd_mt14">{fields.body}</p>
              {summary && fields.result_title !== undefined && (
                <ResultBox kind="wait" title={fill(fields.result_title, summary)} className="ixd_text_left">
                  {fields.result_body !== undefined ? fill(fields.result_body, summary) : undefined}
                </ResultBox>
              )}
              {fields.actions && (
                <ButtonRow className="ixd_row_center">
                  <CmsButtons links={fields.actions} />
                </ButtonRow>
              )}
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
