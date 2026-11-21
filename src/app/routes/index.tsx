import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { RootLayout } from '@/app/layouts/RootLayout';
import { NotFound } from '@/components/NotFound';
import { TwScope } from '@/components/TwScope';
import { publicRoutes } from './public.routes';
import { authRoutes, legacyAuthRoutes } from './auth.routes';
import { portalRoutes } from './portal.routes';
import { adminRoutes } from './admin.routes';
import { privateRoutes } from './private.routes';
import { designRoutes } from './design.routes';

// Dev-only design-system board (/design). Excluded from production builds.
const devRoutes: RouteObject[] = import.meta.env.DEV ? [designRoutes] : [];

// The single, centralized route table (design-reference/ROUTES.md, ARCHITECTURE.md §4).
// Layouts compose via nested routes; guards are wrapper components, not scattered effects.
//   public (+ /:lang) → PublicLayout · /auth → AuthLayout · /portal → PortalShell ·
//   /admin → AdminShell · starter /app and /auth/legacy (Tailwind scope) · 404.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      ...publicRoutes,
      authRoutes,
      legacyAuthRoutes,
      portalRoutes,
      adminRoutes,
      privateRoutes,
      ...devRoutes,
      {
        path: '*',
        element: (
          <TwScope>
            <NotFound />
          </TwScope>
        ),
      },
    ],
  },
]);
