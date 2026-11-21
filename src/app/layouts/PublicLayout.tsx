import { useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { BreadcrumbBanner, Footer, PublicHeader, ScrollProgressButton } from '@/components/design';
import { usePageBanner, usePublicChrome } from '@/features/content/hooks/useContent';
import { localizeChrome } from '@/features/content/lib/localizeChrome';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { useRouteHandle } from '@/app/routes/routeHandle';
import { menuAudiencesFor } from '@/domain/rules/access';
import { landingFor } from '@/features/auth/lib/resolveLanding';
import { useAuthStore } from '@/store/authStore';

// Public website layout (README "Four layouts" #1): top info bar + main menu with mega menus,
// the page's breadcrumb banner, the page, the footer with the newsletter sign-up and the
// back-to-top button. Everything visible comes from the CMS (chrome + the page's banner fields)
// or UiStrings; the route's handle says which page this is and which nav item is active. The banner
// is the page's `breadcrumb_banner` section, read from the same page query as <CmsPage>.
// The auth screens render inside the same chrome (AuthLayout).
export function PublicLayout() {
  const handle = useRouteHandle();
  const { locale, locales, setLocale, toPath } = useLocale();
  const t = useT('common');
  const navigate = useNavigate();
  const { data: chrome } = usePublicChrome(locale);
  const pageKey = handle?.pageKey === 'home' ? undefined : handle?.pageKey;
  const { data: banner } = usePageBanner(pageKey, locale);

  const session = useAuthStore((s) => s.session);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // The account menu by role (FE-7): links filtered by audience; signed in, the icon opens the landing.
  const localized = useMemo(() => {
    const base = localizeChrome(chrome, toPath);
    const viewer = isAuthenticated ? session : null;
    const audiences = menuAudiencesFor(viewer && { platformRole: viewer.platformRole, roles: viewer.roles });
    const account = {
      label: viewer ? t('shell.account') : base.nav.account.label,
      to: viewer ? landingFor(viewer) : base.nav.account.to,
      links: base.nav.account.links.filter((link) => link.audience.some((a) => audiences.includes(a))),
    };
    return { ...base, nav: { ...base.nav, account } };
  }, [chrome, toPath, session, isAuthenticated, t]);
  const languages = useMemo(() => locales.map((l) => ({ value: l.code, label: l.nativeName })), [locales]);
  const trail = useMemo(
    // an empty href marks the current page (plain text, aria-current)
    () => banner?.trail.map((crumb) => ({ label: crumb.label, to: crumb.href === '' ? undefined : toPath(crumb.href) })),
    [banner, toPath],
  );

  return (
    <>
      <PublicHeader
        topbar={localized.topbar}
        nav={localized.nav}
        activeNavId={handle?.nav}
        languages={languages}
        language={locale}
        onLanguageChange={setLocale}
        toggleLabel={t('nav.toggle')}
      />
      <main>
        {banner && trail && <BreadcrumbBanner title={banner.title} trail={trail} backgroundUrl={banner.background?.url} />}
        <Outlet />
      </main>
      <Footer content={localized.footer} onSubscribe={() => navigate(localized.footer.newsletter.to)} />
      <ScrollProgressButton label={t('scroll.top')} />
    </>
  );
}
