// Public-site chrome content (ARCHITECTURE.md §3.1, CONTENT_AND_I18N.md §1 "Global content").
// These are the shapes the CMS serves for the navigation menus, the top bar and the footer.
// Every label is already resolved for the current locale; `to` is an in-app path (or an
// external URL when `external` is set). Framework-free: no React types here.
import type { MenuAudience } from './session.types';

export interface CmsImageRef {
  src: string;
  alt: string;
}

export interface ChromeLink {
  label: string;
  to: string;
  external?: boolean;
}

/** An account-menu link, shown to the viewers in `audience` (FE-7: by role). */
export interface AccountLink extends ChromeLink {
  audience: MenuAudience[];
}

/** Social profile link: icon-only, so the label is the accessible name. */
export interface SocialLink {
  /** icon class, e.g. "fab fa-facebook-f" */
  icon: string;
  label: string;
  to: string;
}

/** One link inside a dropdown or mega-menu column. `id` drives the active state. */
export interface NavMenuLink {
  id: string;
  label: string;
  to: string;
  /** `ix_mi` icon class (About mega menu), e.g. "far fa-users" */
  icon?: string;
  /** secondary line under the label (Opportunities mega menu) */
  sub?: string;
  /** right-aligned `ix_count` badge (Volunteer areas column) */
  count?: string;
}

export interface NavMenuColumn {
  heading: string;
  links: NavMenuLink[];
}

/** `list` = plain `.sub_menu`; `mega` = `.ix_mega`; `mega_2` = `.ix_mega.ix_mega_2` (two columns with icons). */
export type NavMenu =
  | { kind: 'list'; links: NavMenuLink[] }
  | { kind: 'mega' | 'mega_2'; columns: NavMenuColumn[] };

export interface NavItem {
  /** top-level id; child ids are `${id}.${child}` so `activeNavId` can name either level */
  id: string;
  label: string;
  to: string;
  menu?: NavMenu;
  /** the design sets aria-haspopup on this item's link */
  ariaHasPopup?: boolean;
}

export interface HeaderCta extends ChromeLink {
  variant: 'default' | 'dark';
  /** hidden ≤1199 px (`ix_hide_md`) */
  hideMd?: boolean;
}

export interface PublicTopBar {
  email: string;
  phone: string;
  socials: SocialLink[];
}

export interface PublicNav {
  brand: { to: string; logo: CmsImageRef };
  items: NavItem[];
  ctas: HeaderCta[];
  account: { label: string; to: string; links: AccountLink[] };
}

export interface FooterStat {
  icon: 'user' | 'dollar';
  value: string;
  label: string;
}

export interface FooterColumn {
  title: string;
  links: ChromeLink[];
}

export interface FooterContactItem {
  icon: 'mail' | 'phone' | 'pin';
  text: string;
}

export interface FooterNewsletter {
  title: string;
  /** visually hidden <label> text */
  label: string;
  placeholder: string;
  /** accessible name of the icon-only submit link */
  submitLabel: string;
  /** where a subscription lands (confirmation page) */
  to: string;
}

export interface PublicFooter {
  logo: { to: string; image: CmsImageRef };
  stats: FooterStat[];
  columns: FooterColumn[];
  contact: { title: string; items: FooterContactItem[] };
  newsletter: FooterNewsletter;
  socials: SocialLink[];
  copyright: string;
  legal: ChromeLink[];
}

export interface PublicChrome {
  topbar: PublicTopBar;
  nav: PublicNav;
  footer: PublicFooter;
}
