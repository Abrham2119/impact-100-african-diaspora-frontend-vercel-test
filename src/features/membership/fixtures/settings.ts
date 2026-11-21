import type { PublicSettingsDto } from '@/types/membership.dto';

// Seed of `GET /settings/public` — the charter settings (BUSINESS_RULES.md "Membership"): four
// levels, $250 minimum, voting above $500, up to 6 installments rounded up to $5, cycle Oct 1 –
// Mar 31, $100,000 goal. Version label as the charter page shows it.
export const publicSettingsFixture: PublicSettingsDto = {
  version_label: 'Discussion draft · Sept 2026',
  levels: [
    { key: 'initiator', amount_cents: 25_000 },
    { key: 'incubator', amount_cents: 50_000 },
    { key: 'innovator', amount_cents: 75_000 },
    { key: 'investor', amount_cents: 100_000 },
  ],
  membership_minimum_cents: 25_000,
  voting_threshold_cents: 50_000,
  max_installments: 6,
  installment_rounding_cents: 500,
  quorum_pct: 50,
  cycle: { starts: '10-01', ends: '03-31' },
  goal_cents: 10_000_000,
};
