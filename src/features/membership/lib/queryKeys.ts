import type { CampaignFilter } from '@/domain/entities/campaign.types';

export const membershipKeys = {
  campaigns: (filter: CampaignFilter) => ['membership', 'campaigns', filter] as const,
};

/** public campaign totals move with payments: 60 s like the content cache */
export const CAMPAIGNS_STALE_TIME = 60_000;
