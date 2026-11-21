import type { ChromeLink, NavItem, NavMenu, PublicChrome } from '@/domain/entities/navigation.types';

// Rewrites every in-app link of the chrome for the current locale (`/about` → `/am/about`),
// so the design components receive ready-to-use paths. `toPath` comes from useLocale().
type ToPath = (to: string) => string;

const link = <T extends { to: string }>(item: T, toPath: ToPath): T => ({ ...item, to: toPath(item.to) });

function menu(m: NavMenu, toPath: ToPath): NavMenu {
  if (m.kind === 'list') return { kind: 'list', links: m.links.map((l) => link(l, toPath)) };
  return { kind: m.kind, columns: m.columns.map((c) => ({ ...c, links: c.links.map((l) => link(l, toPath)) })) };
}

const navItem = (item: NavItem, toPath: ToPath): NavItem => ({
  ...link(item, toPath),
  ...(item.menu ? { menu: menu(item.menu, toPath) } : {}),
});

const links = (list: ChromeLink[], toPath: ToPath) => list.map((l) => (l.external ? l : link(l, toPath)));

export function localizeChrome(chrome: PublicChrome, toPath: ToPath): PublicChrome {
  const { nav, footer } = chrome;
  return {
    topbar: chrome.topbar,
    nav: {
      brand: link(nav.brand, toPath),
      items: nav.items.map((item) => navItem(item, toPath)),
      ctas: nav.ctas.map((cta) => link(cta, toPath)),
      account: { ...link(nav.account, toPath), links: links(nav.account.links, toPath) },
    },
    footer: {
      ...footer,
      logo: link(footer.logo, toPath),
      columns: footer.columns.map((c) => ({ ...c, links: links(c.links, toPath) })),
      newsletter: link(footer.newsletter, toPath),
      legal: links(footer.legal, toPath),
    },
  };
}
