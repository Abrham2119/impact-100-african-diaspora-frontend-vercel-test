import { Fragment, type MouseEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { CmsImageRef } from '@/domain/entities/navigation.types';
import { cx } from '@/lib/classes';

// The dashboard app shell shared by the member portal and the admin console, markup verbatim
// from design-reference/snapshots/portal.html and admin.html:
//   header.ix_top (logo, campaign pill, Donate, bell, avatar)
//   div.ix_app > nav.ix_rail (groups, then exits) + aside.ix_side (user, title, the ACTIVE
//   group's items only — no chevrons; optional `ix_count` badges — then Log out) + main.ix_app_main (crumbs, h1, page).
// Everything arrives resolved (labels, active flags); the shell layouts build it from the
// typed portalMenu / adminMenu config. Responsive behaviour is pure CSS (impact100-ext.css).

export interface ShellLink {
  key: string;
  label: string;
  to: string;
  icon?: string;
  active?: boolean;
  /** sidebar badge `<em class="ix_count">` (open proposals, circulating amendments, reviews to do) — API data */
  count?: number;
}

export interface ShellCrumb {
  label: string;
  to?: string;
}

export interface AppShellProps {
  logo: CmsImageRef & { to: string };
  /** campaign / ballot pill — rendered only when the API provides one */
  pill?: { label: string; to: string };
  donate: { label: string; to: string };
  bell: { label: string; to: string; count?: number };
  account: { label: string; to: string; initials: string };
  rail: { label: string; links: ShellLink[] };
  side: {
    /** aside aria-label, e.g. "Voting menu" */
    label: string;
    title: string;
    user: { name: string; detail?: string; avatarUrl?: string };
    links: ShellLink[];
    logout: { label: string; to: string; onClick: (event: MouseEvent<HTMLAnchorElement>) => void };
  };
  crumbs: { label: string; home: { label: string; to: string }; trail: ShellCrumb[] };
  title: string;
  children: ReactNode;
}

const current = (active?: boolean) => (active ? ({ 'aria-current': 'page' } as const) : {});

export function AppShell({ logo, pill, donate, bell, account, rail, side, crumbs, title, children }: AppShellProps) {
  return (
    <>
      <header className="ix_top">
        <Link className="ix_top_logo" to={logo.to}>
          <img src={logo.src} alt={logo.alt} />
        </Link>
        {pill && (
          <Link className="ix_top_pill" to={pill.to}>
            {pill.label} <i className="far fa-arrow-right" aria-hidden="true" />
          </Link>
        )}
        <div className="ix_top_right">
          <Link className="ix_top_btn" to={donate.to}>
            <i className="far fa-heart" aria-hidden="true" />
            <span>{donate.label}</span>
          </Link>
          <Link className="ix_top_icon" to={bell.to} aria-label={bell.label}>
            <i className="far fa-bell" aria-hidden="true" />
            {bell.count !== undefined && bell.count > 0 && <em>{bell.count}</em>}
          </Link>
          <Link className="ix_top_icon ix_top_avatar" to={account.to} aria-label={account.label}>
            {account.initials}
          </Link>
        </div>
      </header>

      <div className="ix_app">
        <nav className="ix_rail" aria-label={rail.label}>
          {rail.links.map((link) => (
            <Link key={link.key} className={cx('ix_rail_item', link.active && 'ix_on')} to={link.to} {...current(link.active)}>
              <i className={link.icon} aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <aside className="ix_side" aria-label={side.label}>
          <div className="ix_side_user">
            {side.user.avatarUrl && <img src={side.user.avatarUrl} alt="" />}
            <div>
              <b>{side.user.name}</b>
              {side.user.detail && <span>{side.user.detail}</span>}
            </div>
          </div>
          <p className="ix_side_title">{side.title}</p>
          <ul>
            {side.links.map((link) => (
              <li key={link.key}>
                <Link className={cx('ix_side_item', link.active && 'ix_on')} to={link.to} {...current(link.active)}>
                  {link.icon && <i className={link.icon} aria-hidden="true" />}
                  <span>{link.label}</span>
                  {link.count !== undefined && link.count > 0 && <em className="ix_count">{link.count}</em>}
                </Link>
              </li>
            ))}
            <li>
              <Link className="ix_side_item" to={side.logout.to} onClick={side.logout.onClick}>
                <i className="far fa-sign-out" aria-hidden="true" />
                <span>{side.logout.label}</span>
              </Link>
            </li>
          </ul>
        </aside>

        <main className="ix_app_main">
          <nav className="ix_crumbs" aria-label={crumbs.label}>
            <Link to={crumbs.home.to} aria-label={crumbs.home.label}>
              <i className="far fa-home" aria-hidden="true" />
            </Link>
            {crumbs.trail.map((crumb, index) => (
              <Fragment key={index}>
                <i className="far fa-chevron-right ix_sep" aria-hidden="true" />
                {crumb.to !== undefined ? <Link to={crumb.to}>{crumb.label}</Link> : <b>{crumb.label}</b>}
              </Fragment>
            ))}
          </nav>
          <h1 className="ix_app_title">{title}</h1>
          {children}
        </main>
      </div>
    </>
  );
}
