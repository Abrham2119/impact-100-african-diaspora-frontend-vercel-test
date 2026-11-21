import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { PATHS } from '@/app/routes/paths';
import { requiresTwoFactor } from '@/domain/rules/access';
import { useAuthStore } from '@/store/authStore';

// Two-step gate for the admin console (ARCHITECTURE.md §4 "2FA", backend §6.1): people whose role
// requires two-step (Chapter admin, USAFI finance, Content Editor, Super admin) must have passed it
// this session. An enrolled person only ever gets a session after the code (the challenge comes
// first), so a session without two-step here means "not enrolled yet" → the enrol screen, then back.
// The API enforces the same rule on every admin request (403 TWO_FACTOR_REQUIRED).
export function TwoFactorRoute({ children }: { children: ReactNode }) {
  const session = useAuthStore((s) => s.session);
  const mfa = useAuthStore((s) => s.mfa);
  const location = useLocation();

  if (session && requiresTwoFactor(session) && !mfa) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`${PATHS.auth.twoStepSetup}?next=${next}`} replace />;
  }
  return <>{children}</>;
}
