import type { CampaignPublicDto } from '@/types/membership.dto';

// Seed of `GET /campaigns` — the three campaigns of the home "Join the active campaign" block
// (design-reference/pages/index.dc.html `camp`). Amounts are the design's sample figures (FQ8).
export const campaignsFixture: CampaignPublicDto[] = [
  { slug: '2026-27', name: '2026–27 Campaign', starts_on: '2026-10-01', ends_on: '2027-03-31', goal_cents: 10_000_000, raised_cents: 7_184_000, pct: 72, status: 'ACTIVE' },
  { slug: '2025-26', name: '2025–26 Campaign', starts_on: '2025-10-01', ends_on: '2026-03-31', goal_cents: 10_000_000, raised_cents: 9_125_000, pct: 91, status: 'HISTORY' },
  { slug: '2024-25', name: '2024–25 Campaign', starts_on: '2024-10-01', ends_on: '2025-03-31', goal_cents: 10_000_000, raised_cents: 6_450_000, pct: 64, status: 'HISTORY' },
];
