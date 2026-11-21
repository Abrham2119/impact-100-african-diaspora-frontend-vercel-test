import type { User } from '@/domain/entities/user.types';
import type { SessionUser } from '@/domain/entities/session.types';
import { isAdminAudience } from '@/domain/rules/access';
import { PATHS } from '@/app/routes/paths';
import { useAuthStore } from '@/store/authStore';

// Where a signed-in person lands when there is no `?next=` (ARCHITECTURE.md §4 "Landing after
// sign-in"): admin-console roles (Chapter admin, USAFI finance, Content Editor, Hub co-Ambassador,
// Super admin) → /admin, everyone else → /portal.
export function landingFor(session: Pick<SessionUser, 'platformRole' | 'roles'> | null): string {
  return session && isAdminAudience(session) ? PATHS.admin.dashboard : PATHS.portal.dashboard;
}

/**
 * The `landing` resolver PublicOnlyRoute takes: the design session's landing when there is one,
 * otherwise (a starter session) the platform role decides.
 */
export function resolveLanding(user: User | null): string {
  const session = useAuthStore.getState().session;
  if (session) return landingFor(session);
  return user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') ? PATHS.admin.dashboard : PATHS.portal.dashboard;
}

/** A safe in-app `?next=` target (no protocol-relative or external URLs). */
export function safeNext(next: string | null): string | null {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : null;
}
