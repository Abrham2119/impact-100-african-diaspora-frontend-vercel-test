import type { ReactNode } from 'react';

// Two-step gate for the admin console (ARCHITECTURE.md §4 "2FA"): users whose role requires
// two-step (Chapter admin, USAFI finance, Content Editor, Super admin) must have completed it
// this session, otherwise they go to PATHS.auth.twoStep (or .twoStepSetup to enrol).
// The session does not record `mfa` yet — that arrives with the design auth flow (Step 14) —
// so until then this gate passes through. The API enforces two-step on every admin request
// regardless (403 TWO_FACTOR_REQUIRED), so nothing is exposed meanwhile.
export function TwoFactorRoute({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
