import type { RoutingRule, Submission, VolunteerSignup } from '@/domain/entities/engagement.types';
import { AdminError } from '@/domain/rules/admin';
import { collectionsEn } from '@/features/content/fixtures/en/collections';
import { engagementMockStore } from '@/features/engagement/api/engagementStore';
import { SUBMISSIONS } from '@/features/engagement/fixtures/submissions';
import { mockResponse } from '@/infrastructure/api/mock';
import { toCsv } from '@/lib/download';
import { useAuthStore } from '@/store/authStore';
import { recordAudit } from './adminMockStore';

// Engagement in the admin console (backend §4.6 engagement admin): volunteer sign-ups (a Hub
// co-Ambassador sees their hub's only — the scope is the server's), every submitted form with its
// source page and inbox, and the routing rules new forms follow. Contract for INT-4 + the mock.
export interface EngagementAdminRepository {
  signups(): Promise<VolunteerSignup[]>;
  exportSignups(): Promise<string>;
  submissions(): Promise<Submission[]>;
  /** a story goes to the editors as a news draft */
  approveStory(id: string): Promise<void>;
  rules(): Promise<RoutingRule[]>;
  saveRule(rule: Omit<RoutingRule, 'id'> & { id?: string }): Promise<RoutingRule>;
}

const store = engagementMockStore;

/** The team a role belongs to (C:volunteer_roles `team_key`). */
const teamOf = (roleKey: string) => {
  const team = (collectionsEn.volunteer_roles ?? []).find((r) => r.key === roleKey)?.data?.team_key;
  return typeof team === 'string' ? team : null;
};

/** The hubs a signed-in co-Ambassador is scoped to; null = the whole chapter (admins). */
function hubScope(): string[] | null {
  const session = useAuthStore.getState().session;
  if (!session || session.platformRole === 'SUPER_ADMIN' || session.roles.some((r) => r.role === 'CHAPTER_ADMIN')) return null;
  const hubs = session.roles.filter((r) => r.role === 'HUB_CO_AMBASSADOR' && r.scopeId).map((r) => r.scopeId as string);
  return hubs.length ? hubs : null;
}
const visibleSignups = () => {
  const hubs = hubScope();
  const all = store.read().signups;
  return hubs ? all.filter((s) => s.roleKeys.some((k) => hubs.some((h) => teamOf(k) === `${h}-hub`))) : all;
};

const sameTarget = (a: Pick<RoutingRule, 'kind' | 'topicKey'>, b: Pick<RoutingRule, 'kind' | 'topicKey'>) => a.kind === b.kind && a.topicKey === b.topicKey;

export const mockEngagementAdminRepository: EngagementAdminRepository = {
  signups: () => mockResponse(visibleSignups),
  exportSignups: () =>
    mockResponse(() => {
      const rows = visibleSignups().map((s) => [s.receivedOn, s.name, s.roleKeys.join(' '), s.location, s.status]);
      recordAudit({ action: 'export.created', entity: `Sign-ups · ${rows.length} rows` });
      return toCsv([['received', 'name', 'roles', 'location', 'placement'], ...rows]);
    }),
  submissions: () => mockResponse(() => store.read().submissions),
  approveStory: (id) =>
    mockResponse(() => {
      const submission = store.read().submissions.find((s) => s.id === id);
      if (!submission) throw new AdminError('NOT_FOUND');
      if (submission.kind !== 'STORY' || submission.status !== 'NEW') throw new AdminError('STATE');
      store.mutate((db) => {
        const s = db.submissions.find((x) => x.id === id);
        if (s) s.status = 'APPROVED';
      });
      recordAudit({ action: 'story.approved', entity: `Story · ${submission.fromName ?? ''}`.trim(), after: submission.title ?? null });
    }),
  rules: () => mockResponse(() => store.read().rules),
  saveRule: ({ id, ...rule }) =>
    mockResponse(() => {
      if (rule.inbox.type === 'ADDRESS' && !rule.inbox.address.trim()) throw new AdminError('REQUIRED');
      const rules = store.read().rules;
      if (rules.some((r) => r.id !== id && sameTarget(r, rule))) throw new AdminError('DUPLICATE');
      const before = id ? rules.find((r) => r.id === id) : undefined;
      if (id && !before) throw new AdminError('NOT_FOUND');
      const inbox = rule.inbox.type === 'ADDRESS' ? { type: 'ADDRESS' as const, address: rule.inbox.address.trim() } : rule.inbox;
      const record: RoutingRule = { ...rule, inbox, id: id ?? `rr-${Date.now().toString(36)}` };
      store.mutate((db) => {
        const index = db.rules.findIndex((r) => r.id === record.id);
        if (index >= 0) db.rules[index] = record;
        else db.rules.push(record);
      });
      const describe = (r: RoutingRule) => `${r.kind} · ${r.topicKey ?? 'any'} → ${r.inbox.type === 'ADDRESS' ? r.inbox.address : r.inbox.type} · auto-reply ${r.autoReply ? 'on' : 'off'}`;
      recordAudit({ action: before ? 'routing.rule_updated' : 'routing.rule_added', entity: `Routing rule · ${record.kind}`, before: before ? describe(before) : null, after: describe(record) });
      return record;
    }),
};

/** Seeded stories waiting for an editor (the dashboard's "stories waiting" moves from the design's figure). */
export const SEED_PENDING_STORIES = SUBMISSIONS.filter((s) => s.kind === 'STORY' && s.status === 'NEW').length;
export const pendingStories = () => store.read().submissions.filter((s) => s.kind === 'STORY' && s.status === 'NEW').length;

/** The engagement admin repository of the configured data source (INT-4 adds the HTTP implementation). */
export const engagementAdminRepository: EngagementAdminRepository = mockEngagementAdminRepository;
