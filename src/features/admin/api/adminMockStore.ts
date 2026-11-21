import type { AdminCampaign, AuditEntry, ExportRecord, FinanceFlag, MatrixRow, Person, PersonActivity, ReconciliationRun } from '@/domain/entities/admin.types';
import type { ChapterRole } from '@/domain/enums/role.enum';
import type { SessionUser } from '@/domain/entities/session.types';
import { summarizeMembership } from '@/domain/rules/membership';
import { membershipMockStore } from '@/features/membership/api/memberRepository';
import { settingsService } from '@/features/membership/api/settingsService';
import { profileMockStore } from '@/features/profile/api/profileRepository';
import { currentMockUserId } from '@/infrastructure/mock/currentUser';
import { createMockStore } from '@/infrastructure/mock/mockStore';
import { useAuthStore } from '@/store/authStore';
import { ADMIN_CAMPAIGNS } from '../fixtures/campaigns';
import { AUDIT, EXPORTS } from '../fixtures/exports';
import { FLAGS, RECONCILIATION_RUNS } from '../fixtures/payments';
import { MATRIX } from '../fixtures/permissions';
import { ACTIVITY, PEOPLE } from '../fixtures/people';

// The admin console's mock data (FE-9): people and their role grants, campaigns, finance flags,
// reconciliation runs, exports, the permission matrix and the audit log. Seeded with the design's
// rows; every admin action changes it and writes an audit entry. (Part B: the admin endpoints.)
export const adminMockStore = createMockStore('admin', () => ({
  people: PEOPLE as Person[],
  activity: ACTIVITY as Record<string, PersonActivity[]>,
  campaigns: ADMIN_CAMPAIGNS as AdminCampaign[],
  flags: FLAGS as FinanceFlag[],
  runs: RECONCILIATION_RUNS as ReconciliationRun[],
  exports: EXPORTS as ExportRecord[],
  matrix: MATRIX as MatrixRow[],
}));
export const auditMockStore = createMockStore('audit', () => ({ entries: AUDIT as AuditEntry[] }));

export const today = () => new Date().toISOString().slice(0, 10);
/** "2026-11-21T14:05" — local wall clock, as the audit log and exports show it */
export const nowStamp = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** A person as currently on record: the portal profile's name, email and hub win when there is one. */
export function withProfile(person: Person): Person {
  const profile = profileMockStore.read().profiles.find((p) => p.userId === person.id);
  return profile ? { ...person, fullName: profile.fullName, email: profile.email, usHubKey: profile.usHubKey } : person;
}

export const membershipOf = (userId: string) => {
  const record = membershipMockStore.read().memberships.find((m) => m.userId === userId);
  return record ? summarizeMembership(record, settingsService.seed()) : null;
};

/** The signed-in admin (the audit log's actor). */
export function actor(): { id: string | null; name: string; role: string | null } {
  const session = useAuthStore.getState().session;
  const id = currentMockUserId() ?? session?.id ?? null;
  const person = adminMockStore.read().people.find((p) => p.id === id);
  const role = session?.platformRole === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : (session?.roles.find((r) => r.role !== 'MEMBER')?.role ?? null);
  return { id, name: person ? withProfile(person).fullName : (session?.fullName ?? ''), role };
}

/** Appends an entry to the audit log (append-only; ids continue the design's numbering). */
export function recordAudit(entry: Pick<AuditEntry, 'action' | 'entity'> & Partial<Pick<AuditEntry, 'subjectId' | 'before' | 'after'>>): void {
  const who = actor();
  auditMockStore.mutate((db) => {
    const next = db.entries.reduce((max, e) => Math.max(max, Number(e.id) || 0), 0) + 1;
    db.entries.unshift({
      id: String(next),
      at: nowStamp(),
      actorId: who.id,
      actorName: who.name,
      actorRole: who.role,
      subjectId: entry.subjectId ?? null,
      before: entry.before ?? null,
      after: entry.after ?? null,
      action: entry.action,
      entity: entry.entity,
    });
  });
}

/**
 * The directory's view of an account for sign-in (mock auth): roles are the person's grants plus
 * Member when the ledger makes them one; a disabled person can't sign in (null). Accounts with no
 * record in the directory (the role demo accounts) are left as they are.
 */
export function directoryAccount(user: SessionUser): SessionUser | null {
  const person = adminMockStore.read().people.find((p) => p.id === user.id);
  if (!person) return user;
  if (person.disabled) return null;
  const roles: ChapterRole[] = person.grants.map(({ role, scopeType, scopeId }) => ({ role, ...(scopeType ? { scopeType, scopeId } : {}) }));
  const membership = membershipOf(person.id);
  const isMember = membership?.levelKey !== null && membership !== null;
  if (isMember && !roles.some((r) => r.role === 'MEMBER')) roles.unshift({ role: 'MEMBER' });
  return { ...user, fullName: withProfile(person).fullName, roles, votingEligible: membership?.votingEligible ?? false };
}

/** People added in the admin console who can sign in (not demo accounts). */
export function directoryOnlyAccounts(knownIds: string[]): SessionUser[] {
  return adminMockStore
    .read()
    .people.filter((p) => !knownIds.includes(p.id) && !p.disabled && p.id.startsWith('p-'))
    .map((p) => directoryAccount({ id: p.id, email: p.email, fullName: p.fullName, platformRole: 'USER', roles: [], votingEligible: false }))
    .filter((u): u is SessionUser => u !== null);
}
