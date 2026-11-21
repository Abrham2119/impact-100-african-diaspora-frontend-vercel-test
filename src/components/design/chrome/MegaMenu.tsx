import type { NavMenu, NavMenuLink } from '@/domain/entities/navigation.types';
import { ChromeAnchor } from './ChromeAnchor';

// Dropdown of a main-menu item, markup verbatim from the snapshots:
//   list   → <ul class="sub_menu"><li><a>Grants &amp; Africa Map</a></li>…</ul>
//   mega   → <ul class="sub_menu ix_mega"><li class="ix_mega_col"><h6>…</h6><ul><li><a><span>Label<small>sub</small></span></a>…
//            (or <a><span>Chapter</span><span class="ix_count">6</span></a>)
//   mega_2 → <ul class="sub_menu ix_mega ix_mega_2"> … <a><span class="ix_mi"><i class="far fa-users"></i>Committees</span></a>
// The current page's link carries class="active" aria-current="page". Hover and active colours
// ("only the hovered and the active item turn orange") are impact100-ext.css rules.

function MenuLink({ link, activeId }: { link: NavMenuLink; activeId?: string }) {
  const active = link.id === activeId;
  const activeProps = active ? { className: 'active', 'aria-current': 'page' as const } : {};
  let content;
  if (link.icon) {
    content = (
      <span className="ix_mi">
        <i className={link.icon} aria-hidden="true" />
        {link.label}
      </span>
    );
  } else if (link.count !== undefined) {
    content = (
      <>
        <span>{link.label}</span>
        <span className="ix_count">{link.count}</span>
      </>
    );
  } else if (link.sub !== undefined) {
    content = (
      <span>
        {link.label}
        <small>{link.sub}</small>
      </span>
    );
  } else {
    content = link.label;
  }
  return (
    <li>
      <ChromeAnchor to={link.to} {...activeProps}>
        {content}
      </ChromeAnchor>
    </li>
  );
}

export function MegaMenu({ menu, activeId }: { menu: NavMenu; activeId?: string }) {
  if (menu.kind === 'list') {
    return (
      <ul className="sub_menu">
        {menu.links.map((link) => (
          <MenuLink key={link.id} link={link} activeId={activeId} />
        ))}
      </ul>
    );
  }
  return (
    <ul className={menu.kind === 'mega_2' ? 'sub_menu ix_mega ix_mega_2' : 'sub_menu ix_mega'}>
      {menu.columns.map((column) => (
        <li className="ix_mega_col" key={column.heading}>
          <h6>{column.heading}</h6>
          <ul>
            {column.links.map((link) => (
              <MenuLink key={link.id} link={link} activeId={activeId} />
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
