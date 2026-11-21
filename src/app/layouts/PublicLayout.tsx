import { useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { BreadcrumbBanner, Footer, PublicHeader, ScrollProgressButton } from '@/components/design';
import { usePageBanner, usePublicChrome } from '@/features/content/hooks/useContent';
import { localizeChrome } from '@/features/content/lib/localizeChrome';
import { useLocale } from '@/i18n/useLocale';
import { useT } from '@/i18n/useT';
import { useRouteHandle } from '@/app/routes/routeHandle';

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

  const localized = useMemo(() => localizeChrome(chrome, toPath), [chrome, toPath]);
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
