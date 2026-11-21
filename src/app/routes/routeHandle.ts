import { useMatches } from 'react-router-dom';
import type { CmsPageKey } from '@/domain/entities/content.types';
import type { ShellRouteMeta } from '@/config/navigation/types';

// Metadata every design route declares in its `handle` (read by the layouts):
//   screen  — the design screen file (design-reference/snapshots/<screen>.html)
//   pageKey — the CMS page (public + auth): breadcrumb banner, later the whole page (Step 5)
//   nav     — the public main-menu item marked active ("about", "about.committees" …);
//             per page, exactly as the snapshots mark it (see PublicHeader)
//   shell   — portal/admin: active rail group + sidebar item, h1 and breadcrumb
export interface RouteHandle {
  screen: string;
  pageKey?: CmsPageKey;
  nav?: string;
  shell?: ShellRouteMeta<'portal'> | ShellRouteMeta<'admin'>;
}

const isRouteHandle = (value: unknown): value is RouteHandle =>
  typeof value === 'object' && value !== null && typeof (value as { screen?: unknown }).screen === 'string';

/** The handle of the deepest matched design route, if any. */
export function useRouteHandle(): RouteHandle | undefined {
  const matches = useMatches();
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const handle = matches[i]?.handle;
    if (isRouteHandle(handle)) return handle;
  }
  return undefined;
}
