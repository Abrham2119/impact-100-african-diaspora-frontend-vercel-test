import { useRouteHandle } from '@/app/routes/routeHandle';
import { CmsPage } from '@/features/content/components/CmsPage';
import { ScreenPlaceholder } from '@/pages/ScreenPlaceholder';

// One page component for every CMS-composed public route (Step 5): the route handle's
// `pageKey` says which CMS page to render. Routes without a page key keep the placeholder.
export function CmsRoutePage() {
  const handle = useRouteHandle();
  if (!handle?.pageKey) return <ScreenPlaceholder />;
  return <CmsPage key={handle.pageKey} pageKey={handle.pageKey} />;
}
