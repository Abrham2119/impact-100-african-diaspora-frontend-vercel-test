import type { ReactNode } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PATHS } from '@/app/routes/paths';
import type { User } from '@/domain/entities/user.types';
import { safeNext } from '@/features/auth/lib/resolveLanding';

// Keeps logged-in users out of sign-in / sign-up. They go to `?next=` when present,
// otherwise to `landing` (starter: the dashboard; design auth: resolveLanding).
export function PublicOnlyRoute({
  children,
  landing = PATHS.app.dashboard,
}: {
  children: ReactNode;
  landing?: string | ((user: User | null) => string);
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const [params] = useSearchParams();
  if (isAuthenticated) {
    const target = safeNext(params.get('next')) ?? (typeof landing === 'function' ? landing(user) : landing);
    return <Navigate to={target} replace />;
  }
  return <>{children}</>;
}
