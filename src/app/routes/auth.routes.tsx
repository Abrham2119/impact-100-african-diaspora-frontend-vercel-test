import type { ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { StarterAuthLayout } from '@/app/layouts/StarterAuthLayout';
import { PublicOnlyRoute } from '@/app/guards/PublicOnlyRoute';
import { ProtectedRoute } from '@/app/guards/ProtectedRoute';
import { RoutePending } from '@/app/guards/RoutePending';
import { TwScope } from '@/components/TwScope';
import { resolveLanding } from '@/features/auth/lib/resolveLanding';
import { CmsRoutePage } from '@/pages/public/CmsRoutePage';
import { SignInPage } from '@/pages/auth/legacy/SignInPage';
import { SignUpPage } from '@/pages/auth/legacy/SignUpPage';
import { VerifyOtpPage } from '@/pages/auth/legacy/VerifyOtpPage';
import { LoginTwoFactorPage } from '@/pages/auth/legacy/LoginTwoFactorPage';
import { ForgotPasswordPage } from '@/pages/auth/legacy/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/legacy/ResetPasswordPage';
import type { RouteHandle } from './routeHandle';

// /auth/* — the design sign-in screens 34–39 (+ the emailed-link landing, ARCHITECTURE §4 37b)
// inside the public chrome, composed from their CMS pages (FE-7, mock auth in Part A). Signed-in users are sent on to `?next=` or their landing
// (admin console / member portal). Two-step set-up needs a session; the two-step challenge
// happens mid-login, before there is one.
const publicOnly = (child: ReactNode) => <PublicOnlyRoute landing={resolveLanding}>{child}</PublicOnlyRoute>;

const screen = (path: string, handle: RouteHandle, guard: (child: ReactNode) => ReactNode = publicOnly): RouteObject => ({
  path,
  handle,
  element: guard(<CmsRoutePage />),
});

export const authRoutes: RouteObject = {
  path: 'auth',
  element: <AuthLayout />,
  children: [
    screen('sign-in', { screen: 'sign_in', pageKey: 'auth_sign_in' }),
    // the emailed login link lands here and renders check_email's valid / expired states
    screen('sign-in/link', { screen: 'check_email', pageKey: 'auth_check_email' }, (child) => child),
    screen('sign-up', { screen: 'sign_up', pageKey: 'auth_sign_up' }),
    screen('forgot-password', { screen: 'forgot_password', pageKey: 'auth_forgot' }),
    screen('check-email', { screen: 'check_email', pageKey: 'auth_check_email' }),
    screen('two-step', { screen: 'two_step', pageKey: 'auth_two_step' }),
    screen('two-step/setup', { screen: 'two_step_enrol', pageKey: 'auth_two_step_setup' }, (child) => (
      <ProtectedRoute pending={<RoutePending />}>{child}</ProtectedRoute>
    )),
  ],
};

// /auth/legacy/* — the starter's password screens, unchanged and unlinked from the design UI
// (decision F1), in the starter scope; logged-in users go to the starter dashboard as before.
export const legacyAuthRoutes: RouteObject = {
  path: 'auth/legacy',
  element: (
    <TwScope>
      <PublicOnlyRoute>
        <StarterAuthLayout />
      </PublicOnlyRoute>
    </TwScope>
  ),
  children: [
    { path: 'sign-in', element: <SignInPage /> },
    { path: 'sign-up', element: <SignUpPage /> },
    { path: 'verify-otp', element: <VerifyOtpPage /> },
    { path: 'two-factor', element: <LoginTwoFactorPage /> },
    { path: 'forgot-password', element: <ForgotPasswordPage /> },
    { path: 'reset-password', element: <ResetPasswordPage /> },
  ],
};
