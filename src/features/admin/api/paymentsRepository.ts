import type { FinanceFlag, LedgerEntry, PaymentSource, ReconciliationRun } from '@/domain/entities/admin.types';
import { AdminError, campaignFor } from '@/domain/rules/admin';
import { applyPayment } from '@/domain/rules/membership';
import { membershipMockStore } from '@/features/membership/api/memberRepository';
import { appendLedger, ledgerMockStore } from '@/features/membership/api/ledgerStore';
import { mockResponse } from '@/infrastructure/api/mock';
import { actor, adminMockStore, nowStamp, recordAudit, today, withProfile } from './adminMockStore';

// Payments (backend §4.7 admin payments, offline, flags, reconciliation). Contract for INT-4 + the
// mock: an offline payment counts toward the member's pledge like an online one (level, vote and
// charter recomputed everywhere); what goes above the pledge is flagged, never counted.
export interface PaymentsRepository {
  ledger(): Promise<LedgerEntry[]>;
  recordOffline(input: { personId: string; amountCents: number; method: Exclude<PaymentSource, 'WAZI'>; date: string; reason: string }): Promise<LedgerEntry>;
  flags(): Promise<FinanceFlag[]>;
  resolveFlag(id: string): Promise<void>;
  reconciliation(): Promise<ReconciliationRun[]>;
  runReconciliation(): Promise<ReconciliationRun>;
}

const nameOf = (personId: string, fallback: string) => {
  const person = adminMockStore.read().people.find((p) => p.id === personId);
  return person ? withProfile(person).fullName : fallback;
};

export const mockPaymentsRepository: PaymentsRepository = {
  ledger: () => mockResponse(() => ledgerMockStore.read().entries.map((e) => ({ ...e, personName: nameOf(e.personId, e.personName) }))),
  recordOffline: ({ personId, amountCents, method, date, reason }) =>
    mockResponse(() => {
      if (!Number.isFinite(amountCents) || amountCents <= 0) throw new AdminError('AMOUNT');
      if (!campaignFor(adminMockStore.read().campaigns, date)) throw new AdminError('OUTSIDE_CYCLE');
      const record = membershipMockStore.read().memberships.find((m) => m.userId === personId);
      if (!record) throw new AdminError('NO_PLEDGE');
      const applied = applyPayment(record, amountCents, date);
      membershipMockStore.mutate((db) => {
        const index = db.memberships.findIndex((m) => m.userId === personId);
        db.memberships[index] = applied.record;
        (db.contributions[personId] ??= []).unshift({
          id: `${personId}-off-${Date.now().toString(36)}`,
          date,
          kind: 'INSTALLMENT',
          installmentSeq: applied.record.installments.filter((i) => i.status === 'PAID').length,
          installmentCount: applied.record.installments.length,
          amountCents,
        });
      });
      const who = actor();
      const name = nameOf(personId, '');
      const entry = appendLedger({
        date,
        personId,
        personName: name,
        kind: 'PLEDGE',
        countryKey: null,
        portfolioKey: null,
        amountCents,
        source: method,
        reference: null,
        recordedBy: who.name,
        reason: reason.trim(),
        status: applied.overpaidCents > 0 ? 'OVERPAID' : 'CONFIRMED',
      });
      adminMockStore.mutate((db) => {
        (db.activity[personId] ??= []).unshift({ date, kind: 'OFFLINE_PAYMENT', values: { amount: String(amountCents) } });
        if (applied.overpaidCents > 0) {
          db.flags.unshift({
            id: `fl-${Date.now().toString(36)}`,
            raisedOn: today(),
            type: 'OVERPAYMENT',
            personId,
            personName: name,
            values: { amount: String(applied.overpaidCents), pledge: String(record.pledgeCents) },
            status: 'OPEN',
            resolvedBy: null,
          });
        }
      });
      recordAudit({ action: 'payment.offline_recorded', entity: `Payment · $${(amountCents / 100).toLocaleString('en-US')}`, subjectId: personId, after: reason.trim() });
      return entry;
    }),
  flags: () => mockResponse(() => adminMockStore.read().flags.map((f) => ({ ...f, personName: nameOf(f.personId, f.personName) }))),
  resolveFlag: (id) =>
    mockResponse(() => {
      const flag = adminMockStore.read().flags.find((f) => f.id === id);
      if (!flag) throw new AdminError('NOT_FOUND');
      const who = actor();
      adminMockStore.mutate((db) => {
        const f = db.flags.find((x) => x.id === id);
        if (f) Object.assign(f, { status: 'RESOLVED', resolvedBy: who.name });
      });
      recordAudit({ action: 'flag.resolved', entity: `Finance flag · ${flag.personName}`, subjectId: flag.personId });
    }),
  reconciliation: () => mockResponse(() => adminMockStore.read().runs),
  runReconciliation: () =>
    mockResponse(() => {
      const checked = ledgerMockStore.read().entries.filter((e) => e.source === 'WAZI').length;
      const run: ReconciliationRun = { id: `rr-${Date.now().toString(36)}`, ranAt: nowStamp(), checked, recovered: 0, duplicates: 0, badSignatures: 0, status: 'OK' };
      adminMockStore.mutate((db) => void db.runs.unshift(run));
      recordAudit({ action: 'reconciliation.run', entity: `Reconciliation · ${checked} checked` });
      return run;
    }),
};

/** The payments repository of the configured data source (INT-4 adds the HTTP implementation). */
export const paymentsRepository: PaymentsRepository = mockPaymentsRepository;
