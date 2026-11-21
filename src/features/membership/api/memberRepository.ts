import type { Contribution, MembershipSummary } from '@/domain/entities/membership.types';
import { summarizeMembership } from '@/domain/rules/membership';
import { mockResponse } from '@/infrastructure/api/mock';
import { currentMockUserId } from '@/infrastructure/mock/currentUser';
import { createMockStore } from '@/infrastructure/mock/mockStore';
import { profileMockStore } from '@/features/profile/api/profileRepository';
import { CONTRIBUTIONS, MEMBERSHIPS } from '../fixtures/memberships';
import { appendLedger } from './ledgerStore';
import { settingsService } from './settingsService';

// The signed-in member's own membership (backend §4.7 `me/membership`, `me/installments`,
// `installments/:id/pay`, `me/contributions`). Contract for INT-3 + the mock implementation on the
// persisted mock store. Paying: the next installment goes to PROCESSING ("Opening WAZIImpact.org…"),
// and the mock "WAZI webhook" confirms it a moment later — the summary only changes on confirmation.
export interface MemberRepository {
  /** null = no membership in the active campaign */
  summary(): Promise<MembershipSummary | null>;
  contributions(): Promise<Contribution[]>;
  payNextInstallment(): Promise<{ amountCents: number } | null>;
}

const profileName = (userId: string) => profileMockStore.read().profiles.find((p) => p.userId === userId)?.fullName ?? '';

const store = createMockStore('membership', () => ({ memberships: MEMBERSHIPS, contributions: CONTRIBUTIONS }));
/** how long the mock WAZIImpact.org takes to confirm a payment */
export const MOCK_PAYMENT_CONFIRM_MS = 2500;

const confirm = (userId: string, installmentId: string) =>
  store.mutate((db) => {
    const record = db.memberships.find((m) => m.userId === userId);
    const item = record?.installments.find((i) => i.id === installmentId);
    if (!record || !item || item.status !== 'PROCESSING') return;
    const today = new Date().toISOString().slice(0, 10);
    item.status = 'PAID';
    item.paidOn = today;
    const nextDue = record.installments.filter((i) => i.status === 'SCHEDULED').sort((a, b) => a.seq - b.seq)[0];
    if (nextDue) nextDue.status = 'DUE';
    appendLedger({
      date: today,
      personId: userId,
      personName: profileName(userId),
      kind: 'PLEDGE',
      countryKey: null,
      portfolioKey: null,
      amountCents: item.amountCents,
      source: 'WAZI',
      recordedBy: null,
      reason: null,
      status: 'CONFIRMED',
    });
    const list = (db.contributions[userId] ??= []);
    list.unshift({
      id: `${userId}-p${item.seq}-${today}`,
      date: today,
      kind: 'INSTALLMENT',
      installmentSeq: item.seq,
      installmentCount: record.installments.length,
      amountCents: item.amountCents,
    });
  });

/** confirmations already scheduled (a reload re-arms any payment still processing) */
const pending = new Set<string>();
const scheduleConfirm = (userId: string, installmentId: string) => {
  if (pending.has(installmentId)) return;
  pending.add(installmentId);
  setTimeout(() => {
    pending.delete(installmentId);
    confirm(userId, installmentId);
  }, MOCK_PAYMENT_CONFIRM_MS);
};

export const mockMemberRepository: MemberRepository = {
  summary: () =>
    mockResponse(() => {
      const userId = currentMockUserId();
      const record = store.read().memberships.find((m) => m.userId === userId);
      if (!record || !userId) return null;
      const processing = record.installments.find((i) => i.status === 'PROCESSING');
      if (processing) scheduleConfirm(userId, processing.id);
      return summarizeMembership(record, settingsService.seed());
    }),
  contributions: () => mockResponse(() => store.read().contributions[currentMockUserId() ?? ''] ?? []),
  payNextInstallment: () =>
    mockResponse(() => {
      const userId = currentMockUserId();
      let paying: { id: string; amountCents: number } | null = null;
      store.mutate((db) => {
        const record = db.memberships.find((m) => m.userId === userId);
        const next = record?.installments.filter((i) => i.status === 'DUE' || i.status === 'SCHEDULED').sort((a, b) => a.seq - b.seq)[0];
        if (!next || record?.installments.some((i) => i.status === 'PROCESSING')) return;
        next.status = 'PROCESSING';
        paying = { id: next.id, amountCents: next.amountCents };
      });
      const started = paying as { id: string; amountCents: number } | null;
      if (!started || !userId) return null;
      scheduleConfirm(userId, started.id);
      return { amountCents: started.amountCents };
    }),
};

/** Read-only access for other slices' mocks (e.g. the admin ledger in FE-9). */
export const membershipMockStore = store;

/** The member repository of the configured data source (INT-3 adds the HTTP implementation). */
export const memberRepository: MemberRepository = mockMemberRepository;
