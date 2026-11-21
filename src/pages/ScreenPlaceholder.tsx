import { useLocation } from 'react-router-dom';
import { Note } from '@/components/design';
import { useRouteHandle } from '@/app/routes/routeHandle';

// Step 4 stub, shared by every route in ROUTES.md until its real page lands (public pages in
// Steps 5–6, portal in 15, admin in 16). It shows only developer identifiers — the design
// screen file and the route — never product copy. One component for all routes: the
// layout, guard, banner, active menu item, h1 and crumbs already come from the route handle.
export function ScreenPlaceholder() {
  const handle = useRouteHandle();
  const { pathname } = useLocation();
  const id = `${handle?.screen ?? '?'} · ${pathname}`;

  if (handle?.shell) return <Note>{id}</Note>;
  return (
    <section className="mt_100">
      <div className="container">
        <Note>{id}</Note>
      </div>
    </section>
  );
}
