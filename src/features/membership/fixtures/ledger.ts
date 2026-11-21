import type { LedgerEntry } from '@/domain/entities/admin.types';

// The payments ledger (admin_ledger.dc.html), verbatim: the latest pledge payments and direct
// donations. Payments made during the demo (portal installments, offline payments) are added on top.
const row = (entry: Omit<LedgerEntry, 'portfolioKey' | 'recordedBy' | 'reason'> & Partial<Pick<LedgerEntry, 'portfolioKey' | 'recordedBy' | 'reason'>>): LedgerEntry => ({
  portfolioKey: null,
  recordedBy: null,
  reason: null,
  ...entry,
});

export const LEDGER: LedgerEntry[] = [
  row({ id: 'pay-88231', date: '2026-12-01', personId: 'u-amara', personName: 'Amara Mensah', kind: 'PLEDGE', countryKey: null, amountCents: 17_000, source: 'WAZI', reference: 'wz_88231', status: 'CONFIRMED' }),
  row({
    id: 'pay-88102',
    date: '2026-11-30',
    personId: 'u-grace',
    personName: 'Grace Mwale',
    kind: 'DONATION',
    countryKey: 'kenya',
    portfolioKey: 'diaspora-engagement',
    amountCents: 2_500,
    source: 'WAZI',
    reference: 'wz_88102',
    status: 'CONFIRMED',
  }),
  row({
    id: 'pay-off-0001',
    date: '2026-11-28',
    personId: 'u-david',
    personName: 'David Otieno',
    kind: 'PLEDGE',
    countryKey: null,
    amountCents: 30_000,
    source: 'CHEQUE',
    reference: null,
    recordedBy: 'Aisha Diallo',
    status: 'CONFIRMED',
  }),
  row({ id: 'pay-87990', date: '2026-11-27', personId: 'u-wanjiru', personName: 'Wanjiru Kamau', kind: 'PLEDGE', countryKey: null, amountCents: 110_000, source: 'WAZI', reference: 'wz_87990', status: 'OVERPAID' }),
  row({ id: 'pay-87911', date: '2026-11-26', personId: 'u-tunde', personName: 'Tunde Ade', kind: 'PLEDGE', countryKey: null, amountCents: 25_000, source: 'WAZI', reference: 'wz_87911', status: 'REFUNDED' }),
];
