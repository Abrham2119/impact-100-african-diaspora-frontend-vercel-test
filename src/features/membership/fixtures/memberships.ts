import type { Contribution, MembershipRecord } from '@/domain/entities/membership.types';

// Members' 2026–27 memberships and payments (portal.dc.html, portal_history.dc.html).
// Amara Mensah's are the design's data: Investor pledge of $1,000 in 6 installments (5 × $170 +
// $150), three paid ($510 received), two $25 monthly donations. The other members are minimal
// records derived from admin › People (FE-8 decision, sample data): David Otieno $250 paid
// (Initiator — the design's "$250 member"), Wanjiru Kamau and Kofi Boateng $1,000 paid in full.
// Grace Mwale (donor · volunteer) has donations only.
const inst = (userId: string, seq: number, dueOn: string, cents: number, status: MembershipRecord['installments'][number]['status']) => ({
  id: `${userId}-i${seq}`,
  seq,
  dueOn,
  amountCents: cents,
  status,
  ...(status === 'PAID' ? { paidOn: dueOn } : {}),
});

const paidInFull = (userId: string, memberNo: string, levelKey: string, cents: number): MembershipRecord => ({
  userId,
  campaignSlug: '2026-27',
  memberNo,
  pledgeLevelKey: levelKey,
  pledgeCents: cents,
  validThru: '03/27',
  installments: [inst(userId, 1, '2026-10-01', cents, 'PAID')],
});

export const MEMBERSHIPS: MembershipRecord[] = [
  {
    userId: 'u-amara',
    campaignSlug: '2026-27',
    memberNo: 'IMP · 2627 · 0042',
    pledgeLevelKey: 'investor',
    pledgeCents: 100_000,
    validThru: '03/27',
    installments: [
      inst('u-amara', 1, '2026-10-01', 17_000, 'PAID'),
      inst('u-amara', 2, '2026-11-01', 17_000, 'PAID'),
      inst('u-amara', 3, '2026-12-01', 17_000, 'PAID'),
      inst('u-amara', 4, '2027-01-01', 17_000, 'DUE'),
      inst('u-amara', 5, '2027-02-01', 17_000, 'SCHEDULED'),
      inst('u-amara', 6, '2027-03-01', 15_000, 'SCHEDULED'),
    ],
  },
  paidInFull('u-david', 'IMP · 2627 · 0051', 'initiator', 25_000),
  paidInFull('u-wanjiru', 'IMP · 2627 · 0017', 'investor', 100_000),
  paidInFull('u-kofi', 'IMP · 2627 · 0003', 'investor', 100_000),
];

const donation = (userId: string, id: string, date: string): Contribution => ({
  id: `${userId}-${id}`,
  date,
  kind: 'DONATION',
  frequency: 'monthly',
  amountCents: 2_500,
  portfolioKey: 'diaspora-engagement',
  countryKey: 'kenya',
});
const installment = (userId: string, seq: number, count: number, date: string, cents: number): Contribution => ({
  id: `${userId}-p${seq}`,
  date,
  kind: 'INSTALLMENT',
  installmentSeq: seq,
  installmentCount: count,
  amountCents: cents,
});

/** Confirmed payments per member, newest first (portal_history.dc.html). */
export const CONTRIBUTIONS: Record<string, Contribution[]> = {
  'u-amara': [
    installment('u-amara', 3, 6, '2026-12-01', 17_000),
    donation('u-amara', 'd2', '2026-11-14'),
    installment('u-amara', 2, 6, '2026-11-01', 17_000),
    donation('u-amara', 'd1', '2026-10-14'),
    installment('u-amara', 1, 6, '2026-10-01', 17_000),
  ],
  'u-david': [installment('u-david', 1, 1, '2026-10-01', 25_000)],
  'u-wanjiru': [installment('u-wanjiru', 1, 1, '2026-10-01', 100_000)],
  'u-kofi': [installment('u-kofi', 1, 1, '2026-10-01', 100_000)],
  'u-grace': [donation('u-grace', 'd1', '2026-10-14')],
};
