import { useMemo, type MouseEvent } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { AppShell, ScrollProgressButton, type ShellCrumb, type ShellLink } from '@/components/design';
import type { ShellMenu, ShellNamespace, ShellRouteMeta } from '@/config/navigation/types';
import type { Permission } from '@/domain/enums/permission.enum';
import { useUnreadCount } from '@/features/notifications/hooks/useNotifications';
import { useMe } from '@/features/users/hooks/useUsers';
import { useAuthLogout } from '@/hooks/useAuthLogout';
import { useT } from '@/i18n/useT';
import { useAuthStore } from '@/store/authStore';
import { PATHS } from '@/app/routes/paths';
import { useRouteHandle } from '@/app/routes/routeHandle';
import logoLight from '@/assets/images/logo_impact100_light.webp';

// The one shell layout behind PortalShell and AdminShell (README "Four layouts" #3/#4).
// It turns the typed menu config + the route's `handle.shell` into AppShell props:
//   rail     = the groups the user can open (first visible page each) + the exits;
//   sidebar  = ONLY the active group's pages, then "Log out";
//   crumbs   = Home › console root › page (› detail), h1 = the page title.
// Items the user can't open are hidden (UX only; the API authorizes every request).
// Session data: name/avatar from user-service (`useMe`), unread count from notifications.
// The campaign pill and the user's status line come from the portal/admin APIs (Steps 15/16)
// and are not rendered until then.

function initialsOf(name: string): string {
  const words = name.replace(/@.*$/, '').split(/[\s._-]+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export function ShellLayout<N extends ShellNamespace>({ menu }: { menu: ShellMenu<N> }) {
  const handle = useRouteHandle();
  const meta = handle?.shell?.namespace === menu.namespace ? (handle.shell as ShellRouteMeta<N>) : undefined;
  const t = useT(menu.namespace);
  const tc = useT('common');
  const params = useParams();
  const permissions = useAuthStore((s) => s.permissions);
  const user = useAuthStore((s) => s.user);
  const { data: profile } = useMe();
  const { data: unread } = useUnreadCount();
  const logout = useAuthLogout(PATHS.auth.signIn);

  const visibleGroups = useMemo(() => {
    const allowed = (required?: Permission | Permission[]) =>
      required === undefined || (Array.isArray(required) ? required : [required]).some((p) => permissions.includes(p));
    return menu.groups
      .map((group) => ({ ...group, items: group.items.filter((item) => allowed(item.permission)) }))
      .filter((group) => group.items.length > 0);
  }, [menu, permissions]);

  // Labels come from the full config, so a page stays titled even if its item is hidden.
  const group = menu.groups.find((g) => g.key === meta?.group);
  const sideGroup = visibleGroups.find((g) => g.key === meta?.group) ?? group;
  const item = group?.items.find((i) => i.key === meta?.item);

  const rail: ShellLink[] = [
    ...visibleGroups.map((g) => ({
      key: g.key,
      label: t(g.railLabelKey),
      to: g.items[0]?.to ?? menu.rootTo,
      icon: g.icon,
      active: g.key === meta?.group,
    })),
    ...menu.exits.map((exit) => ({ key: exit.key, label: tc(exit.labelKey), to: exit.to, icon: exit.icon })),
  ];

  const side: ShellLink[] = (sideGroup?.items ?? []).map((i) => ({
    key: i.key,
    label: t(i.labelKey),
    to: i.to,
    icon: i.icon,
    active: i.key === meta?.item,
  }));

  const root: ShellCrumb = { label: t(menu.rootLabelKey), to: menu.rootTo };
  const crumb = meta?.crumb ?? 'item';
  let trail: ShellCrumb[] = [{ label: root.label }];
  if (crumb !== 'root' && item) {
    const itemLabel = t(item.labelKey);
    if (crumb === 'item') trail = [root, { label: itemLabel }];
    else {
      const leaf = 'key' in crumb ? t(crumb.key) : (params[crumb.param] ?? '');
      trail = [root, { label: itemLabel, to: item.to }, { label: leaf }];
    }
  }

  const name = profile?.full_name || user?.email || '';
  const sideTitle = sideGroup ? t(sideGroup.titleKey) : '';

  return (
    <>
      <AppShell
        logo={{ src: logoLight, alt: tc('shell.logoAlt'), to: PATHS.home }}
        donate={{ label: tc('shell.donate'), to: PATHS.public.donate }}
        bell={{ label: tc('shell.notifications'), to: menu.bellTo, count: unread }}
        account={{ label: tc('shell.account'), to: menu.accountTo, initials: initialsOf(name) }}
        rail={{ label: tc('shell.rail'), links: rail }}
        side={{
          label: tc('shell.sideMenu', { group: sideTitle }),
          title: sideTitle,
          user: { name, avatarUrl: profile?.avatar_url ?? undefined },
          links: side,
          logout: {
            label: tc('shell.logout'),
            to: PATHS.auth.signIn,
            onClick: (event: MouseEvent<HTMLAnchorElement>) => {
              event.preventDefault();
              void logout();
            },
          },
        }}
        crumbs={{ label: tc('shell.breadcrumb'), home: { label: tc('shell.home'), to: PATHS.home }, trail }}
        title={meta ? t(meta.titleKey) : ''}
      >
        <Outlet />
      </AppShell>
      <ScrollProgressButton label={tc('scroll.top')} />
    </>
  );
}
