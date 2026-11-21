import type { FinanceFlag, ReconciliationRun } from '@/domain/entities/admin.types';

// Finance flags and reconciliation runs (admin_flags / admin_reconciliation .dc.html), verbatim.
// Flag details are UiStrings filled with these values (amounts in cents, dates ISO).
export const FLAGS: FinanceFlag[] = [
  { id: 'fl-1', raisedOn: '2026-11-27', type: 'OVERPAYMENT', personId: 'u-wanjiru', personName: 'Wanjiru Kamau', values: { amount: '10000', pledge: '100000' }, status: 'OPEN', resolvedBy: null },
  { id: 'fl-2', raisedOn: '2026-11-26', type: 'REFUND', personId: 'u-tunde', personName: 'Tunde Ade', values: { minimum: '25000' }, status: 'OPEN', resolvedBy: null },
  { id: 'fl-3', raisedOn: '2026-04-02', type: 'LATE_INSTALLMENT', personId: 'u-sbanda', personName: 'S. Banda', values: { date: '2026-03-31' }, status: 'RESOLVED', resolvedBy: 'Aisha Diallo' },
];

export const RECONCILIATION_RUNS: ReconciliationRun[] = [
  { id: 'rr-1118', ranAt: '2026-11-18T02:00', checked: 96, recovered: 1, duplicates: 2, badSignatures: 0, status: 'OK' },
  { id: 'rr-1117', ranAt: '2026-11-17T02:00', checked: 88, recovered: 0, duplicates: 0, badSignatures: 0, status: 'OK' },
  { id: 'rr-1116', ranAt: '2026-11-16T02:00', checked: 91, recovered: 0, duplicates: 1, badSignatures: 1, status: 'ALERT' },
];
