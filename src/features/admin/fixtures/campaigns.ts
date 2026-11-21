import type { AdminCampaign } from '@/domain/entities/admin.types';
import { campaignsFixture } from '@/features/membership/fixtures/campaigns';

// Campaigns (admin_cycles.dc.html): the public campaigns plus their grants count, verbatim. The
// active campaign's "Raised" is what the ledger has received; past ones keep their final figure.
const GRANTS: Record<string, number> = { '2026-27': 3, '2025-26': 4, '2024-25': 2 };

export const ADMIN_CAMPAIGNS: AdminCampaign[] = campaignsFixture.map((c) => ({
  slug: c.slug,
  name: c.name,
  startsOn: c.starts_on,
  endsOn: c.ends_on,
  goalCents: c.goal_cents,
  raisedCents: c.raised_cents,
  grants: GRANTS[c.slug] ?? 0,
  grantsNote: '',
  status: c.status === 'ACTIVE' ? 'ACTIVE' : 'HISTORY',
}));

/** The set-up form's prefilled name (admin_cycles.dc.html). */
export const NEXT_CAMPAIGN_NAME = '2027–28 Campaign';
