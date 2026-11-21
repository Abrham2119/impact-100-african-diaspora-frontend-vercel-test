import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Accordion, CampaignGallery, ProgressBar } from '@/components/design';
import { NotFound } from '@/components/NotFound';
import { TwScope } from '@/components/TwScope';
import { useCampaign, usePublicSettings } from '@/features/membership/hooks/useMembership';
import { levelName } from '@/features/membership/lib/levelName';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { cx } from '@/lib/classes';
import { formatDate, formatMoney } from '@/lib/format';
import type { SectionData } from '../../schemas/defineSection';
import { campaignDisplay, faqs, type campaignDetail } from '../../schemas/sectionTypes';
import { useSectionEntries } from '../../hooks/useSectionEntries';
import { CmsButton } from '../CmsButton';
import { RichText } from '../RichText';
import { CollectionState, toImage } from './shared';

// campaign_detail — /campaigns/:slug (campaign_details.dc.html): gallery, figures from the
// membership API, membership level chips (→ /join?level=), and the Description / FAQ / Video tabs
// (fade in as in the design). Display data comes from C:campaign_display, keyed by slug.
const TAB_FADE_MS = 20;

export function CampaignDetailSection({ section }: { section: SectionData<typeof campaignDetail> }) {
  const { slug } = useParams();
  const { fields, settings } = section;
  const { locale, toPath } = useLocale();
  const t = useT('site');
  const campaignQuery = useCampaign(slug);
  const { data: membership } = usePublicSettings();
  const display = useSectionEntries(campaignDisplay, { ...settings.display, keys: slug ? [slug] : [] });
  const faqEntries = useSectionEntries(faqs, settings.faq_source);
  const [level, setLevel] = useState(settings.default_level);
  const [tab, setTab] = useState(0);
  const [shown, setShown] = useState(0);
  const fade = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const faqItems = useMemo(
    () => faqEntries.entries.map((entry) => ({ id: entry.key, question: entry.fields.question, answer: <RichText value={entry.fields.answer} /> })),
    [faqEntries.entries],
  );

  const campaign = campaignQuery.data;
  if (campaign === null) {
    return (
      <TwScope>
        <NotFound />
      </TwScope>
    );
  }

  const info = display.entries[0];
  const gallery = (info?.media.gallery ?? (info ? [info.media.image] : [])).map(toImage);
  const tabs = [fields.tab_description, fields.tab_faq, fields.tab_video];
  const pickTab = (i: number) => {
    if (i === tab) return;
    setTab(i);
    setShown(-1);
    clearTimeout(fade.current);
    fade.current = setTimeout(() => setShown(i), TAB_FADE_MS);
  };
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    pickTab((tab + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length);
  };
  const pane = (i: number) => cx('tab-pane fade', tab === i && 'active', shown === i && 'show');

  return (
    <section className="campaign_details mt_100">
      <div className="container">
        <CollectionState isPending={campaignQuery.isPending} isError={campaignQuery.isError} isEmpty={!campaign} onRetry={() => void campaignQuery.refetch()}>
          {campaign && (
            <>
              <div className="row">
                <div className="col-xl-6 col-lg-6">
                  <CampaignGallery images={gallery} thumbLabel={(n) => t('gallery.thumb', { n })} />
                </div>
                <div className="col-xl-6 col-lg-6">
                  <div className="campaign_details_text">
                    <h2>{campaign.name}</h2>
                    <ProgressBar label={t('campaign.progress')} labelClassName="founded" percent={campaign.pct}>
                      <p className="rising_goal">
                        <span>
                          <b>{t('campaign.progress')}</b>
                          {` ${formatMoney(campaign.raisedCents, locale)}`}
                        </span>
                        <span>
                          <b>{t('campaign.goalLabel')}</b>
                          {` ${formatMoney(campaign.goalCents, locale)}`}
                        </span>
                      </p>
                    </ProgressBar>
                    <ul>
                      <li>
                        <span>{fields.label_period}</span>
                        {` ${t('campaign.period', { start: formatDate(campaign.startsOn, locale), end: formatDate(campaign.endsOn, locale) })}`}
                      </li>
                      <li>
                        <span>{fields.label_status}</span>
                        {` ${t(campaign.status === 'active' ? 'campaign.status.active' : 'campaign.status.completed')}`}
                      </li>
                      <li>
                        <span>{fields.label_who}</span>
                        {` ${fields.who_can_join}`}
                      </li>
                    </ul>
                    <div className="video_donate_text">
                      <h5>{fields.membership_title}</h5>
                      <div className="video_donation_box">
                        <ul>
                          {membership.levels.map((option) => (
                            <li
                              key={option.key}
                              className={cx(option.key === level && 'active')}
                              role="button"
                              tabIndex={0}
                              aria-pressed={option.key === level}
                              onClick={() => setLevel(option.key)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  setLevel(option.key);
                                }
                              }}
                            >
                              {t('level.chip', { name: levelName(t, option.key), amount: formatMoney(option.amountCents, locale) })}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <CmsButton link={{ ...fields.cta, href: `${fields.cta.href}?level=${encodeURIComponent(level)}` }} />
                      {fields.renew_text !== undefined && (
                        <p className="ixd_mt14">
                          {`${fields.renew_text} `}
                          {fields.renew_link && (
                            <Link className="ix_link" to={toPath(fields.renew_link.href)}>
                              {fields.renew_link.label}
                            </Link>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt_100">
                <div className="col-12">
                  <ul className="nav nav-pills" id="pills-tab" role="tablist">
                    {tabs.map((label, i) => (
                      <li key={label} className="nav-item" role="presentation">
                        <button
                          className={cx('nav-link', tab === i && 'active')}
                          type="button"
                          role="tab"
                          id={`campaign-tab-${i}`}
                          aria-selected={tab === i}
                          aria-controls={`campaign-pane-${i}`}
                          tabIndex={tab === i ? 0 : -1}
                          onClick={() => pickTab(i)}
                          onKeyDown={onTabKey}
                        >
                          {label}
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="tab-content" id="pills-tabContent">
                    <div className={pane(0)} role="tabpanel" id="campaign-pane-0" aria-labelledby="campaign-tab-0">
                      <div className="campaign_description pt_20">{info?.fields.description && <RichText value={info.fields.description} plainLists />}</div>
                    </div>
                    <div className={pane(1)} role="tabpanel" id="campaign-pane-1" aria-labelledby="campaign-tab-1">
                      <Accordion idPrefix={`campaign-faq-${section.id}`} items={faqItems} className="mt_60" />
                    </div>
                    <div className={pane(2)} role="tabpanel" id="campaign-pane-2" aria-labelledby="campaign-tab-2">
                      <div className="campaign_details_videos mt_60">
                        {info?.data.video_url !== undefined && (
                          <div className="dc_video">
                            <a className="play_btn" href={info.data.video_url} target="_blank" rel="noopener" aria-label={t('video.playYoutube')}>
                              <i aria-hidden="true" className="far fa-play" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CollectionState>
      </div>
    </section>
  );
}
