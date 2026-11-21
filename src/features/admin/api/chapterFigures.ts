import type { LedgerEntry } from '@/domain/entities/admin.types';
import type { MembershipRecord } from '@/domain/entities/membership.types';
import type { MembershipSettings } from '@/domain/entities/membership.types';
import { summarizeMembership } from '@/domain/rules/membership';
import { membershipMockStore } from '@/features/membership/api/memberRepository';
import { ledgerMockStore } from '@/features/membership/api/ledgerStore';
import { settingsService } from '@/features/membership/api/settingsService';
import { LEDGER } from '@/features/membership/fixtures/ledger';
import { MEMBERSHIPS } from '@/features/membership/fixtures/memberships';
import { adminMockStore, withProfile } from './adminMockStore';
import { FLAGS } from '../fixtures/payments';
import { PEOPLE } from '../fixtures/people';

// The chapter's figures = the design's numbers (the baseline, which already include the demo
// members) + what changed in the demo's own records since the seed. So Amara paying $170 in the
// portal moves "Received" from $71,840 to $72,010, and an offline payment that makes David a voting
// member adds one to "Voting-eligible".
const LEVELS = ['initiator', 'incubator', 'innovator', 'investor'] as const;

interface Figures {
  members: number;
  voting: number;
  receivedCents: number;
  pledgedCents: number;
  notMembers: number;
  byLevel: Record<string, number>;
  byPledge: Record<string, { pledges: number; pledgedCents: number; receivedCents: number; paidInFull: number }>;
  hubs: Record<string, { members: number; receivedCents: number; pledgedCents: number }>;
}

function figures(records: MembershipRecord[], settings: MembershipSettings, hubOf: (userId: string) => string | null): Figures {
  const f: Figures = {
    members: 0,
    voting: 0,
    receivedCents: 0,
    pledgedCents: 0,
    notMembers: 0,
    byLevel: Object.fromEntries(LEVELS.map((l) => [l, 0])),
    byPledge: Object.fromEntries(LEVELS.map((l) => [l, { pledges: 0, pledgedCents: 0, receivedCents: 0, paidInFull: 0 }])),
    hubs: {},
  };
  records.forEach((record) => {
    const s = summarizeMembership(record, settings);
    f.receivedCents += s.receivedCents;
    f.pledgedCents += record.pledgeCents;
    if (s.levelKey) {
      f.members += 1;
      f.byLevel[s.levelKey] = (f.byLevel[s.levelKey] ?? 0) + 1;
    } else f.notMembers += 1;
    if (s.votingEligible) f.voting += 1;
    const pledge = (f.byPledge[record.pledgeLevelKey] ??= { pledges: 0, pledgedCents: 0, receivedCents: 0, paidInFull: 0 });
    pledge.pledges += 1;
    pledge.pledgedCents += record.pledgeCents;
    pledge.receivedCents += s.receivedCents;
    if (s.toGoCents === 0) pledge.paidInFull += 1;
    const hub = hubOf(record.userId);
    if (hub) {
      const h = (f.hubs[hub] ??= { members: 0, receivedCents: 0, pledgedCents: 0 });
      if (s.levelKey) h.members += 1;
      h.receivedCents += s.receivedCents;
      h.pledgedCents += record.pledgeCents;
    }
  });
  return f;
}

const seedHub = (userId: string) => PEOPLE.find((p) => p.id === userId)?.usHubKey ?? null;
const liveHub = (userId: string) => {
  const person = adminMockStore.read().people.find((p) => p.id === userId);
  return person ? withProfile(person).usHubKey : null;
};

const SEED_LEDGER_IDS = new Set(LEDGER.map((e) => e.id));
const SEED_OPEN_FLAGS = FLAGS.filter((f) => f.status === 'OPEN').length;

/** What changed in the demo records since the seed (live − seed), per figure. */
export function demoDelta() {
  const settings = settingsService.seed();
  const seed = figures(MEMBERSHIPS, settings, seedHub);
  const live = figures(membershipMockStore.read().memberships, settings, liveHub);
  const newEntries: LedgerEntry[] = ledgerMockStore.read().entries.filter((e) => !SEED_LEDGER_IDS.has(e.id));
  const donations = newEntries.filter((e) => e.kind === 'DONATION' && e.status !== 'REFUNDED');
  return {
    members: live.members - seed.members,
    voting: live.voting - seed.voting,
    receivedCents: live.receivedCents - seed.receivedCents,
    pledgedCents: live.pledgedCents - seed.pledgedCents,
    notMembers: live.notMembers - seed.notMembers,
    level: (key: string) => (live.byLevel[key] ?? 0) - (seed.byLevel[key] ?? 0),
    pledge: (key: string) => {
      const a = live.byPledge[key] ?? { pledges: 0, pledgedCents: 0, receivedCents: 0, paidInFull: 0 };
      const b = seed.byPledge[key] ?? { pledges: 0, pledgedCents: 0, receivedCents: 0, paidInFull: 0 };
      return { pledges: a.pledges - b.pledges, pledgedCents: a.pledgedCents - b.pledgedCents, receivedCents: a.receivedCents - b.receivedCents, paidInFull: a.paidInFull - b.paidInFull };
    },
    hub: (key: string) => {
      const a = live.hubs[key] ?? { members: 0, receivedCents: 0, pledgedCents: 0 };
      const b = seed.hubs[key] ?? { members: 0, receivedCents: 0, pledgedCents: 0 };
      return { members: a.members - b.members, receivedCents: a.receivedCents - b.receivedCents, pledgedCents: a.pledgedCents - b.pledgedCents };
    },
    donationsCents: donations.reduce((sum, e) => sum + e.amountCents, 0),
    gifts: donations.length,
    donationsBy: (portfolioKey: string) => donations.filter((e) => e.portfolioKey === portfolioKey).reduce((sum, e) => sum + e.amountCents, 0),
    openFlags: adminMockStore.read().flags.filter((f) => f.status === 'OPEN').length - SEED_OPEN_FLAGS,
  };
}
