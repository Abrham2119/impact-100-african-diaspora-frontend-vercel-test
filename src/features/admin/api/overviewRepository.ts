import type { ChapterDashboard, FinanceSummary, HubDashboard } from '@/domain/entities/admin.types';
import { governanceRepository } from '@/features/governance/api/governanceRepository';
import { charterSettingsMockStore } from '@/features/membership/api/charterSettingsStore';
import { settingsService } from '@/features/membership/api/settingsService';
import { mockResponse } from '@/infrastructure/api/mock';
import { CHAPTER, HUB_EVENTS, HUB_SIGNUPS, HUBS } from '../fixtures/chapter';
import { adminMockStore, withProfile } from './adminMockStore';
import { demoDelta } from './chapterFigures';

// Overview (backend §4.7 admin dashboard, funnel, finance, hub summary): the chapter dashboard,
// finance overview and a hub's dashboard. Contract for INT-4 + the mock (design baseline + the demo's changes).
export interface AdminOverviewRepository {
  dashboard(): Promise<ChapterDashboard>;
  finance(): Promise<FinanceSummary>;
  /** the hub's dashboard; the scope is fixed by the server (a co-Ambassador sees their hub only) */
  hub(hubKey: string): Promise<HubDashboard | null>;
}

const pos = (n: number) => Math.max(0, n);

export const mockAdminOverviewRepository: AdminOverviewRepository = {
  dashboard: async () => {
    const ballot = await governanceRepository.ballot();
    return mockResponse(() => {
      const d = demoDelta();
      const settings = settingsService.seed();
      return {
        cycleLabel: CHAPTER.cycleLabel,
        members: pos(CHAPTER.members + d.members),
        votingEligible: pos(CHAPTER.votingEligible + d.voting),
        receivedCents: CHAPTER.receivedCents + d.receivedCents,
        pledgedCents: CHAPTER.pledgedCents + d.pledgedCents,
        turnoutPct: Math.round((ballot.yesNo / ballot.ballot.eligibleCount) * 100),
        quorumPct: settings.quorumPct,
        byLevel: CHAPTER.byLevel.map((l) => ({ levelKey: l.levelKey, count: pos(l.count + d.level(l.levelKey)) })),
        levelScale: CHAPTER.levelScale,
        pledgedNotMembers: pos(CHAPTER.pledgedNotMembers + d.notMembers),
        funnel: CHAPTER.funnel.map((f) => ({ ...f })),
        attention: {
          approvals: charterSettingsMockStore.read().changes.filter((c) => c.status === 'PENDING').length,
          flags: pos(CHAPTER.attention.flags + d.openFlags),
          nominations: CHAPTER.attention.nominations,
          stories: CHAPTER.attention.stories,
        },
      };
    });
  },
  finance: () =>
    mockResponse(() => {
      const d = demoDelta();
      return {
        pledgedCents: CHAPTER.pledgedCents + d.pledgedCents,
        receivedCents: CHAPTER.receivedCents + d.receivedCents,
        donationsCents: CHAPTER.finance.donationsCents + d.donationsCents,
        gifts: CHAPTER.finance.gifts + d.gifts,
        openFlags: pos(CHAPTER.attention.flags + d.openFlags),
        donationsByPortfolio: CHAPTER.finance.donationsByPortfolio.map((p) => ({ portfolioKey: p.portfolioKey, cents: p.cents + d.donationsBy(p.portfolioKey) })),
        byLevel: CHAPTER.finance.byLevel.map((l) => {
          const x = d.pledge(l.levelKey);
          return {
            levelKey: l.levelKey,
            pledges: pos(l.pledges + x.pledges),
            pledgedCents: l.pledgedCents + x.pledgedCents,
            receivedCents: l.receivedCents + x.receivedCents,
            paidInFull: pos(l.paidInFull + x.paidInFull),
          };
        }),
      };
    }),
  hub: (hubKey) =>
    mockResponse(() => {
      const base = HUBS[hubKey];
      if (!base) return null;
      const d = demoDelta().hub(hubKey);
      const ambassadors = adminMockStore
        .read()
        .people.filter((p) => !p.disabled && p.grants.some((g) => g.role === 'HUB_CO_AMBASSADOR' && g.scopeId === hubKey))
        .map((p) => withProfile(p).fullName);
      return {
        hubKey,
        ambassadors,
        members: pos(base.members + d.members),
        signups: base.signups,
        rsvps: base.rsvps,
        receivedCents: base.receivedCents + d.receivedCents,
        pledgedCents: base.pledgedCents + d.pledgedCents,
        recentSignups: HUB_SIGNUPS.filter((s) => s.hubKey === hubKey).map(({ hubKey: _h, ...s }) => ({ ...s })),
        events: HUB_EVENTS.filter((e) => e.hubKey === hubKey).map(({ hubKey: _h, ...e }) => ({ ...e })),
      };
    }),
};

/** The overview repository of the configured data source (INT-4 adds the HTTP implementation). */
export const adminOverviewRepository: AdminOverviewRepository = mockAdminOverviewRepository;
