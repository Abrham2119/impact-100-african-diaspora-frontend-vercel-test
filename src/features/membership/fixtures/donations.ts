import type { DonationCancelInfoDto } from '@/types/membership.dto';

// Seed of `GET /donations/cancel?token=` — the monthly gift shown on cancel_gift.dc.html
// ($50 a month · Sustainable Development · Ghana, started Oct 14, 2026, next charge Dec 14, 2026).
export const donationCancelFixture: DonationCancelInfoDto = {
  amount_cents: 5_000,
  frequency: 'MONTHLY',
  portfolio: 'sustainable-development',
  country: 'ghana',
  started_at: '2026-10-14',
  next_charge_on: '2026-12-14',
  status: 'ACTIVE',
};
