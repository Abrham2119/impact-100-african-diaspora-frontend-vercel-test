import type { MenuAudience, SessionUser } from '@/domain/entities/session.types';
import type { ChapterRole, ChapterRoleName } from '@/domain/enums/role.enum';
import type { Permission } from '@/domain/enums/permission.enum';
import { ROLE_PERMISSIONS } from '@/constant/roleMatrix';

// Access rules of backend docs/ARCHITECTURE.md §6.1: two-step requirement, admin audience, permissions.

/** Roles that require TOTP two-step on every sign-in (and the platform super admin). */
const TWO_FACTOR_ROLES: ReadonlyArray<ChapterRoleName> = ['CONTENT_EDITOR', 'USAFI_FINANCE', 'CHAPTER_ADMIN'];
/** Roles whose work is in the admin console (hub dashboard, finance, CMS, chapter admin). */
const ADMIN_CONSOLE_ROLES: ReadonlyArray<ChapterRoleName> = ['CHAPTER_ADMIN', 'USAFI_FINANCE', 'CONTENT_EDITOR', 'HUB_CO_AMBASSADOR'];

const has = (roles: ChapterRole[], names: ReadonlyArray<ChapterRoleName>) => roles.some((r) => names.includes(r.role));

export function requiresTwoFactor(user: Pick<SessionUser, 'platformRole' | 'roles'>): boolean {
  return user.platformRole === 'SUPER_ADMIN' || has(user.roles, TWO_FACTOR_ROLES);
}

/** Uses the admin console (shows "Admin Console" in the account menu, lands on /admin). */
export function isAdminAudience(user: Pick<SessionUser, 'platformRole' | 'roles'>): boolean {
  return user.platformRole === 'SUPER_ADMIN' || has(user.roles, ADMIN_CONSOLE_ROLES);
}

/** Where a role's grants come from: the default matrix, or the edited one (admin › Permission matrix). */
let rolePermissions: (role: ChapterRoleName) => Permission[] = (role) => ROLE_PERMISSIONS[role];
export function setRolePermissionSource(source: (role: ChapterRoleName) => Permission[]): void {
  rolePermissions = source;
}

/** The union of the roles' grants (§6.3). Super admin bypasses checks in the store. */
export function permissionsFor(roles: ChapterRole[]): Permission[] {
  return [...new Set(roles.flatMap((r) => rolePermissions(r.role)))];
}

/** The account-menu audiences a viewer belongs to (signed out → login + join; by role once signed in). */
export function menuAudiencesFor(user: Pick<SessionUser, 'platformRole' | 'roles'> | null): MenuAudience[] {
  if (!user) return ['signedOut', 'nonMember'];
  const admin = isAdminAudience(user);
  const member = user.roles.some((r) => r.role === 'MEMBER');
  return ['signedIn', ...(admin ? (['admin'] as const) : []), ...(!member && !admin ? (['nonMember'] as const) : [])];
}
