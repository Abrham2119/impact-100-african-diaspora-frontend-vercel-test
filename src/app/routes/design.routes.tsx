import type { RouteObject } from 'react-router-dom';

// /design — the design-system board (Step 3). Registered only in dev builds
// (see routes/index.tsx) and lazily loaded, so its code never ships to production.
export const designRoutes: RouteObject = {
  path: 'design/:board?',
  lazy: async () => {
    const { DesignPage } = await import('@/pages/design/DesignPage');
    return { Component: DesignPage };
  },
};
