// Locale prefixes on public URLs (decision F2): the default locale has no prefix
// (`/about`), every other enabled locale does (`/am/about`). Auth, portal, admin and the
// starter screens never carry a prefix.

/** Path roots that are never locale-prefixed; their locale follows the saved preference. */
export const PREFIXLESS_ROOTS = ['auth', 'portal', 'admin', 'app', 'design'] as const;

const firstSegment = (pathname: string): string => pathname.split('/')[1] ?? '';

export function isPrefixlessPath(pathname: string): boolean {
  return (PREFIXLESS_ROOTS as readonly string[]).includes(firstSegment(pathname));
}

/** The locale code in the URL prefix, if it is one of `prefixable` (enabled, non-default). */
export function prefixLocale(pathname: string, prefixable: readonly string[]): string | null {
  const segment = firstSegment(pathname);
  return prefixable.includes(segment) ? segment : null;
}

/** Removes a locale prefix: `/am/about` → `/about`, `/am` → `/`. */
export function stripLocale(pathname: string, prefixable: readonly string[]): string {
  const code = prefixLocale(pathname, prefixable);
  if (!code) return pathname;
  const rest = pathname.slice(code.length + 1);
  return rest === '' ? '/' : rest;
}

/**
 * The public URL of `to` in `locale`. Only in-app absolute paths of public pages are
 * prefixed; external URLs, anchors and prefix-less roots are returned unchanged.
 */
export function localePath(to: string, locale: string, defaultLocale: string): string {
  if (locale === defaultLocale || !to.startsWith('/') || isPrefixlessPath(to)) return to;
  return to === '/' ? `/${locale}` : `/${locale}${to}`;
}
