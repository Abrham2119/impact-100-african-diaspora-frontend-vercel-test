import type { MatrixRow, Person, PersonActivity, PersonDetail, PersonRow, RoleSummary } from '@/domain/entities/admin.types';
import type { ChapterRoleName } from '@/domain/enums/role.enum';
import { AdminError, checkAdminRemoval, checkGrant } from '@/domain/rules/admin';
import { requiresTwoFactor } from '@/domain/rules/access';
import { ledgerMockStore } from '@/features/membership/api/ledgerStore';
import { LEDGER } from '@/features/membership/fixtures/ledger';
import { profileMockStore } from '@/features/profile/api/profileRepository';
import { mockResponse } from '@/infrastructure/api/mock';
import { PEOPLE, ROLE_PEOPLE_BASELINE } from '../fixtures/people';
import { actor, adminMockStore, membershipOf, recordAudit, today, withProfile } from './adminMockStore';
import { demoDelta } from './chapterFigures';

// People, roles and the permission matrix (backend §4.1 admin users / roles / permissions).
// Contract for INT-4 + the mock: role grants follow the rules (one grant per role, two
// co-Ambassadors per hub, the last two admins stay, never your own grant) and every change is audited.
export interface PeopleRepository {
  list(): Promise<PersonRow[]>;
  person(id: string): Promise<PersonDetail | null>;
  addPerson(input: { fullName: string; email: string; usHubKey: string | null }): Promise<PersonRow>;
  grantRole(input: { personId: string; role: ChapterRoleName; hubKey: string | null }): Promise<void>;
  revokeRole(input: { personId: string; role: ChapterRoleName; scopeId: string | null }): Promise<void>;
  setAccess(input: { personId: string; enabled: boolean }): Promise<void>;
  roles(): Promise<RoleSummary[]>;
  matrix(): Promise<MatrixRow[]>;
  updateMatrix(rows: MatrixRow[]): Promise<void>;
}

export const ASSIGNABLE_ROLES: ChapterRoleName[] = ['MEMBER', 'COMMITTEE_MEMBER', 'HUB_CO_AMBASSADOR', 'CONTENT_EDITOR', 'CHAPTER_ADMIN', 'USAFI_FINANCE'];

function row(person: Person): PersonRow {
  const p = withProfile(person);
  const m = membershipOf(p.id);
  return { ...p, levelKey: m?.levelKey ?? null, votingEligible: m?.votingEligible ?? false, isMember: Boolean(m?.levelKey) };
}

const SEED_LEDGER_IDS = new Set(LEDGER.map((e) => e.id));

/** Stored activity, then the demo's payments and audited actions about the person, newest first. */
function activityOf(personId: string): PersonActivity[] {
  const stored = adminMockStore.read().activity[personId] ?? [];
  const payments: PersonActivity[] = ledgerMockStore
    .read()
    .entries.filter((e) => e.personId === personId && !SEED_LEDGER_IDS.has(e.id) && e.source === 'WAZI')
    .map((e) => ({ date: e.date, kind: 'PAYMENT', values: { amount: String(e.amountCents) } }));
  return [...payments, ...stored].sort((a, b) => b.date.localeCompare(a.date));
}

const find = (id: string) => {
  const person = adminMockStore.read().people.find((p) => p.id === id);
  if (!person) throw new AdminError('NOT_FOUND');
  return person;
};
const addActivity = (personId: string, item: PersonActivity) =>
  adminMockStore.mutate((db) => {
    (db.activity[personId] ??= []).unshift(item);
  });

export const mockPeopleRepository: PeopleRepository = {
  list: () => mockResponse(() => adminMockStore.read().people.filter((p) => p.listed).map(row)),
  person: (id) =>
    mockResponse(() => {
      const person = adminMockStore.read().people.find((p) => p.id === id);
      if (!person) return null;
      const r = row(person);
      const m = membershipOf(id);
      const profile = profileMockStore.read().profiles.find((p) => p.userId === id);
      return {
        ...r,
        avatarFile: profile?.avatarFile ?? null,
        receivedCents: m?.receivedCents ?? 0,
        pledgeLevelKey: m?.record.pledgeLevelKey ?? null,
        pledgeCents: m?.record.pledgeCents ?? 0,
        installmentCount: m?.record.installments.length ?? 0,
        africanHubKey: profile?.africanHubKey ?? null,
        portfolioKey: profile?.portfolioKey ?? null,
        activity: activityOf(id),
      };
    }),
  addPerson: ({ fullName, email, usHubKey }) =>
    mockResponse(() => {
      const clean = email.trim().toLowerCase();
      if (adminMockStore.read().people.some((p) => withProfile(p).email.toLowerCase() === clean)) throw new AdminError('EMAIL_TAKEN');
      const person: Person = {
        id: `p-${Date.now().toString(36)}`,
        fullName: fullName.trim(),
        email: email.trim(),
        usHubKey,
        joinedOn: today(),
        grants: [],
        tags: [],
        waziLinked: false,
        disabled: false,
        listed: true,
      };
      adminMockStore.mutate((db) => void db.people.push(person));
      recordAudit({ action: 'person.created', entity: `Person · ${person.fullName}`, subjectId: person.id });
      return row(person);
    }),
  grantRole: ({ personId, role, hubKey }) =>
    mockResponse(() => {
      const target = find(personId);
      if (actor().id === personId) throw new AdminError('OWN_CHANGE');
      checkGrant(adminMockStore.read().people, target, role, hubKey);
      const by = actor().name;
      adminMockStore.mutate((db) => {
        const p = db.people.find((x) => x.id === personId);
        p?.grants.push({ role, grantedBy: by, grantedOn: today(), ...(role === 'HUB_CO_AMBASSADOR' && hubKey ? { scopeType: 'HUB' as const, scopeId: hubKey } : {}) });
      });
      addActivity(personId, { date: today(), kind: 'ROLE_GRANTED', values: { role } });
      recordAudit({ action: 'role.granted', entity: `Person · ${withProfile(target).fullName}`, subjectId: personId, after: role + (hubKey && role === 'HUB_CO_AMBASSADOR' ? ` · ${hubKey}` : '') });
    }),
  revokeRole: ({ personId, role, scopeId }) =>
    mockResponse(() => {
      const target = find(personId);
      if (role === 'MEMBER') throw new AdminError('ROLE_HELD');
      if (actor().id === personId) throw new AdminError('OWN_CHANGE');
      if (role === 'CHAPTER_ADMIN') checkAdminRemoval(adminMockStore.read().people, target);
      adminMockStore.mutate((db) => {
        const p = db.people.find((x) => x.id === personId);
        if (p) p.grants = p.grants.filter((g) => !(g.role === role && (scopeId === null || g.scopeId === scopeId)));
      });
      addActivity(personId, { date: today(), kind: 'ROLE_REVOKED', values: { role } });
      recordAudit({ action: 'role.revoked', entity: `Person · ${withProfile(target).fullName}`, subjectId: personId, before: role });
    }),
  setAccess: ({ personId, enabled }) =>
    mockResponse(() => {
      const target = find(personId);
      if (actor().id === personId) throw new AdminError('OWN_CHANGE');
      if (!enabled) checkAdminRemoval(adminMockStore.read().people, target);
      adminMockStore.mutate((db) => {
        const p = db.people.find((x) => x.id === personId);
        if (p) p.disabled = !enabled;
      });
      if (!enabled) addActivity(personId, { date: today(), kind: 'ACCESS_DISABLED', values: {} });
      recordAudit({ action: enabled ? 'person.enabled' : 'person.disabled', entity: `Person · ${withProfile(target).fullName}`, subjectId: personId });
    }),
  roles: () =>
    mockResponse(() => {
      const count = (people: Person[], role: ChapterRoleName) => people.filter((p) => !p.disabled && p.grants.some((g) => g.role === role)).length;
      const live = adminMockStore.read().people;
      const members = ROLE_PEOPLE_BASELINE.MEMBER + demoDelta().members;
      return ASSIGNABLE_ROLES.map((role) => ({
        role,
        people: role === 'MEMBER' ? Math.max(0, members) : Math.max(0, ROLE_PEOPLE_BASELINE[role] + count(live, role) - count(PEOPLE, role)),
        twoFactor: requiresTwoFactor({ platformRole: 'USER', roles: [{ role }] }),
      }));
    }),
  matrix: () => mockResponse(() => adminMockStore.read().matrix),
  updateMatrix: (rows) =>
    mockResponse(() => {
      const before = adminMockStore.read().matrix;
      const changes = rows.reduce(
        (sum, r) => sum + Object.entries(r.cells).filter(([k, v]) => before.find((b) => b.module === r.module && b.roleLabel === r.roleLabel)?.cells[k as keyof typeof r.cells] !== v).length,
        0,
      );
      adminMockStore.mutate((db) => {
        db.matrix = rows;
      });
      if (changes > 0) recordAudit({ action: 'permissions.updated', entity: `Permission matrix · ${changes} cells` });
    }),
};

/** The people repository of the configured data source (INT-4 adds the HTTP implementation). */
export const peopleRepository: PeopleRepository = mockPeopleRepository;
