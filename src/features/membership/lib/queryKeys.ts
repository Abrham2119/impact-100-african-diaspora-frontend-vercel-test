import type { CampaignFilter } from '@/domain/entities/campaign.types';

export const membershipKeys = {
  campaigns: (filter: CampaignFilter) => ['membership', 'campaigns', filter] as const,
  campaign: (slug: string) => ['membership', 'campaign', slug] as const,
  settings: () => ['membership', 'settings'] as const,
  joinIntent: (intentId: string) => ['membership', 'join-intent', intentId] as const,
  donationCancel: (token: string) => ['membership', 'donation-cancel', token] as const,
};

/** public campaign totals move with payments: 60 s like the content cache */
export const CAMPAIGNS_STALE_TIME = 60_000;

/** charter settings change only with a new charter version: 5 min */
export const SETTINGS_STALE_TIME = 300_000;
