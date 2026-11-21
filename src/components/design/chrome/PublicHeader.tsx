import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { PublicNav, PublicTopBar } from '@/domain/entities/navigation.types';
import { cx } from '@/lib/classes';
import { useScrolledPast } from '@/hooks/useWindowScroll';
import { ButtonLink } from '../primitives/Button';
import { ChromeAnchor } from './ChromeAnchor';
import { LanguageSelect, type LanguageOption } from './LanguageSelect';
import { MegaMenu } from './MegaMenu';
import { MenuIcon, TopbarMailIcon, TopbarPhoneIcon, UserIcon } from './icons';

// Public site header = top info bar (<header>) + main menu (<nav class="main_menu">), markup
// verbatim from design-reference/snapshots/index.html. One component for every public and auth
// page, fed by the CMS nav (navConfig) — never copied per page.
// - `activeNavId` names the current page's item: a top id ("opportunities") marks only the
//   top link `.nav-link.active`; a child id ("about.committees") also marks that sub link.
// - Sticky: `menu_fix` once the page scrolls (design boilerplate `fix`).
// - Mobile (<992 px): the toggler opens `.navbar-collapse.show`; the CSS then lists every
//   sub-menu item statically. The menu closes on navigation.
// - The currency select of the template is intentionally not rendered (decision F3).

export interface PublicHeaderProps {
  topbar: PublicTopBar;
  nav: PublicNav;
  activeNavId?: string;
  languages: LanguageOption[];
  language: string;
  onLanguageChange: (value: string) => void;
  /** accessible name of the mobile menu toggler (UiString) */
  toggleLabel: string;
}

const MENU_ID = 'navbarSupportedContent';

export function PublicHeader({
  topbar,
  nav,
  activeNavId,
  languages,
  language,
  onLanguageChange,
  toggleLabel,
}: PublicHeaderProps) {
  const fixed = useScrolledPast(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname, search } = useLocation();
  const activeTop = activeNavId?.split('.')[0];

  useEffect(() => setMenuOpen(false), [pathname, search]);

  return (
    <>
      <header>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 d-none d-lg-block">
              <ul className="header_info">
                <li>
                  <span>
                    <TopbarMailIcon />
                  </span>
                  {topbar.email}
                </li>
                <li>
                  <span>
                    <TopbarPhoneIcon />
                  </span>
                  {topbar.phone}
                </li>
              </ul>
            </div>
            <div className="col-lg-6">
              <div className="header_right">
                <ul className="icon d-none d-sm-flex">
                  {topbar.socials.map((social) => (
                    <li key={social.label}>
                      <ChromeAnchor to={social.to} aria-label={social.label}>
                        <i className={social.icon} aria-hidden="true" />
                      </ChromeAnchor>
                    </li>
                  ))}
                </ul>
                <ul className="language_currency">
                  <li>
                    <LanguageSelect options={languages} value={language} onChange={onLanguageChange} />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className={cx('navbar navbar-expand-lg main_menu', fixed && 'menu_fix')}>
        <div className="container">
          <ChromeAnchor className="navbar-brand" to={nav.brand.to}>
            <img src={nav.brand.logo.src} alt={nav.brand.logo.alt} className="img-fluid w-100" />
          </ChromeAnchor>
          <button
            className="navbar-toggler"
            type="button"
            aria-controls={MENU_ID}
            aria-expanded={menuOpen}
            aria-label={toggleLabel}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon />
          </button>
          <div className={cx('collapse navbar-collapse', menuOpen && 'show')} id={MENU_ID}>
            <ul className="navbar-nav m-auto">
              {nav.items.map((item) => (
                <li className="nav-item" key={item.id}>
                  <ChromeAnchor
                    className={cx('nav-link', item.id === activeTop && 'active')}
                    to={item.to}
                    aria-haspopup={item.ariaHasPopup ? 'true' : undefined}
                  >
                    {item.label}
                    {item.menu && (
                      <>
                        {' '}
                        <i className="far fa-chevron-down" aria-hidden="true" />
                      </>
                    )}
                  </ChromeAnchor>
                  {item.menu && <MegaMenu menu={item.menu} activeId={activeNavId} />}
                </li>
              ))}
            </ul>
            <div className="menu_right">
              {nav.ctas.map((cta) => (
                <ButtonLink
                  key={cta.to}
                  to={cta.to}
                  variant={cta.variant}
                  className={cta.hideMd ? 'ix_hide_md' : undefined}
                >
                  {cta.label}
                </ButtonLink>
              ))}
              <div className="user_icon">
                <ChromeAnchor className="user_link" to={nav.account.to} aria-label={nav.account.label}>
                  <UserIcon />
                </ChromeAnchor>
                <ul>
                  {nav.account.links.map((link) => (
                    <li key={link.to}>
                      <ChromeAnchor to={link.to}>{link.label}</ChromeAnchor>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
