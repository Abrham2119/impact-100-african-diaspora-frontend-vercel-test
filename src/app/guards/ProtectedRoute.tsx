import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PATHS } from '@/app/routes/paths';
import { FullPageSpinner } from '@/components/ui/Spinner';

// Auth gate for the private areas. Waits for store rehydration so a refresh
// doesn't flash the login page. The intended destination is preserved twice:
// as router state (starter sign-in) and as `?next=` (design sign-in, ARCHITECTURE §4).
export function ProtectedRoute({
  children,
  signInPath = PATHS.auth.signIn,
  pending = <FullPageSpinner />,
}: {
  children: ReactNode;
  /** the design sign-in by default; the starter `/app/*` passes the legacy one */
  signInPath?: string;
  /** shown while the session rehydrates */
  pending?: ReactNode;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const location = useLocation();

  if (isHydrating) return <>{pending}</>;

  if (!isAuthenticated) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`${signInPath}?next=${next}`} replace state={{ from: location }} />;
  }
  return <>{children}</>;
}
