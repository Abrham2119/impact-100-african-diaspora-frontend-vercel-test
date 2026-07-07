import type { RouteObject } from 'react-router-dom';
import { AuthLayout } from '@/app/layouts/AuthLayout';
import { PublicOnlyRoute } from '@/app/guards/PublicOnlyRoute';
import { SignInPage } from '@/pages/auth/SignInPage';
import { SignUpPage } from '@/pages/auth/SignUpPage';
import { VerifyOtpPage } from '@/pages/auth/VerifyOtpPage';

// /auth/* — sign-in / sign-up / verify-otp, kept behind PublicOnlyRoute so
// logged-in users are redirected to the dashboard.
export const authRoutes: RouteObject = {
  path: 'auth',
  element: (
    <PublicOnlyRoute>
      <AuthLayout />
    </PublicOnlyRoute>
  ),
  children: [
    { path: 'sign-in', element: <SignInPage /> },
    { path: 'sign-up', element: <SignUpPage /> },
    { path: 'verify-otp', element: <VerifyOtpPage /> },
  ],
};
