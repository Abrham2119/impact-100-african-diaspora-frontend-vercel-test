import type { User } from '@/domain/entities/user.types';
import { PATHS } from '@/app/routes/paths';

// Where a signed-in user lands when there is no `?next=` (ARCHITECTURE.md §4 "Landing after
// sign-in"): admin roles → the admin console, everyone else → the member portal.
// Today the session only carries the platform role; Step 14 extends this to the chapter roles
// (CHAPTER_ADMIN, USAFI_FINANCE, CONTENT_EDITOR, HUB_CO_AMBASSADOR).
const ADMIN_PLATFORM_ROLES: ReadonlyArray<User['role']> = ['SUPER_ADMIN', 'ADMIN'];

export function resolveLanding(user: User | null): string {
  return user && ADMIN_PLATFORM_ROLES.includes(user.role) ? PATHS.admin.dashboard : PATHS.portal.dashboard;
}

/** A safe in-app `?next=` target (no protocol-relative or external URLs). */
export function safeNext(next: string | null): string | null {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : null;
}
