import { useMemo } from 'react';
import { CampaignCard } from '@/components/design';
import { PATHS } from '@/app/routes/paths';
import { useCampaigns } from '@/features/membership/hooks/useCampaigns';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { formatDate, formatMoney } from '@/lib/format';
import type { SectionData } from '../../schemas/defineSection';
import { campaignDisplay, type campaignCards } from '../../schemas/sectionTypes';
import { useSectionEntries } from '../../hooks/useSectionEntries';
import { CmsImage } from '../CmsImage';
import { CollectionState, SectionHeadingRow, toImage } from './shared';

// campaign_cards — "Join the active campaign" (index.dc.html `camp`). Figures come from the
// membership API (`GET /campaigns`); the card image from C:campaign_display, keyed by slug.
// The active campaign leads to joining; completed ones to their details page.
export function CampaignCardsSection({ section }: { section: SectionData<typeof campaignCards> }) {
  const { settings, fields, media } = section;
  const { locale, toPath } = useLocale();
  const t = useT('site');
  const campaignsQuery = useCampaigns(settings.status);

  const campaigns = useMemo(
    () =>
      (campaignsQuery.data ?? [])
        .filter((campaign) => campaign.status !== 'scheduled')
        .sort((a, b) => b.startsOn.localeCompare(a.startsOn))
        .slice(0, settings.limit),
    [campaignsQuery.data, settings.limit],
  );
  const slugs = useMemo(() => campaigns.map((campaign) => campaign.slug), [campaigns]);
  const display = useSectionEntries(campaignDisplay, { ...settings.display, keys: slugs });
  const imageBySlug = useMemo(() => new Map(display.entries.map((entry) => [entry.key, entry.media.image])), [display.entries]);

  return (
    <section className="campaign mt_100 pt_100">
      {media.background && (
        <div className="campaign_bg">
          <CmsImage media={media.background} />
        </div>
      )}
      <div className="container">
        <SectionHeadingRow kicker={fields.kicker} title={fields.title} lead={fields.lead} />
        <CollectionState
          isPending={campaignsQuery.isPending}
          isError={campaignsQuery.isError}
          isEmpty={campaigns.length === 0}
          onRetry={() => void campaignsQuery.refetch()}
        >
          <div className="row mt_30">
            {campaigns.map((campaign) => {
              const active = campaign.status === 'active';
              const href = toPath(PATHS.public.campaignDetail(campaign.slug));
              const image = imageBySlug.get(campaign.slug);
              return (
                <div key={campaign.slug} className="col-xl-4 col-md-6">
                  <CampaignCard
                    href={href}
                    image={image ? toImage(image) : undefined}
                    tag={t(active ? 'campaign.status.active' : 'campaign.status.completed')}
                    progressLabel={t('campaign.progress')}
                    percent={campaign.pct}
                    raisedLabel={t('campaign.raised', { amount: formatMoney(campaign.raisedCents, locale) })}
                    goalLabel={t('campaign.goal', { amount: formatMoney(campaign.goalCents, locale) })}
                    title={t('campaign.title', {
                      name: campaign.name,
                      start: formatDate(campaign.startsOn, locale),
                      end: formatDate(campaign.endsOn, locale),
                    })}
                    cta={
                      active
                        ? { label: t('campaign.cta.active'), to: toPath(PATHS.public.join) }
                        : { label: t('campaign.cta.completed'), to: href }
                    }
                  />
                </div>
              );
            })}
          </div>
        </CollectionState>
      </div>
    </section>
  );
}
