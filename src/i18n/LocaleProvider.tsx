import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Locale, TextDirection } from '@/domain/entities/locale.types';
import { useLocales } from '@/features/content/hooks/useContent';
import { contentService } from '@/features/content/api/contentService';
import { localeStorage } from '@/infrastructure/storage/locale.storage';
import { isPrefixlessPath, localePath, prefixLocale, stripLocale } from './localePath';

// Locale state (ARCHITECTURE.md §8.1–8.3). Mounted inside the router (RootLayout) because the
// URL prefix is part of the locale. Resolution:
//   public URL  → its /:lang prefix, otherwise the default locale (decision F2);
//   prefix-less areas (auth, portal, admin) → ?lang= / cookie / navigator.languages / default.
// Every result is checked against the enabled locales. The signed-in user's saved
// preference (users/me/settings.language) joins the chain when auth is wired (Step 14).

export interface LocaleContextValue {
  locale: string;
  direction: TextDirection;
  defaultLocale: string;
  locales: Locale[];
  /** switches language and keeps the user on the same page */
  setLocale: (code: string) => void;
  /** `to` in the current locale (adds or keeps the /:lang prefix on public paths) */
  toPath: (to: string) => string;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

function browserLocale(enabled: readonly string[]): string | null {
  for (const tag of navigator.languages ?? []) {
    const base = tag.toLowerCase().split('-')[0] ?? '';
    if (enabled.includes(base)) return base;
  }
  return null;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const { data: locales } = useLocales();
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();

  const defaultLocale = locales.find((l) => l.isDefault)?.code ?? contentService.defaultLocale;
  const enabled = useMemo(() => locales.map((l) => l.code), [locales]);
  const prefixable = useMemo(() => enabled.filter((code) => code !== defaultLocale), [enabled, defaultLocale]);

  const [preferred, setPreferred] = useState<string>(() => {
    const saved = localeStorage.get();
    if (saved && enabled.includes(saved)) return saved;
    return browserLocale(enabled) ?? defaultLocale;
  });

  const locale =
    prefixLocale(pathname, prefixable) ?? (isPrefixlessPath(pathname) ? preferred : defaultLocale);
  const direction = locales.find((l) => l.code === locale)?.direction ?? 'ltr';

  const goToLocale = useCallback(
    (code: string, query: string) => {
      const target = localePath(stripLocale(pathname, prefixable), code, defaultLocale);
      navigate(`${target}${query}${hash}`, { replace: true });
    },
    [pathname, prefixable, defaultLocale, hash, navigate],
  );

  const setLocale = useCallback(
    (code: string) => {
      if (!enabled.includes(code)) return;
      localeStorage.set(code);
      setPreferred(code);
      if (!isPrefixlessPath(pathname)) goToLocale(code, search);
    },
    [enabled, pathname, search, goToLocale],
  );

  // ?lang=xx is accepted on any route: public routes move to the prefixed URL,
  // other routes store it as the preference. The parameter is then dropped.
  useEffect(() => {
    const params = new URLSearchParams(search);
    const requested = params.get('lang');
    if (requested === null) return;
    params.delete('lang');
    const rest = params.toString() ? `?${params.toString()}` : '';
    if (enabled.includes(requested)) {
      localeStorage.set(requested);
      setPreferred(requested);
    }
    const code = enabled.includes(requested) ? requested : locale;
    if (isPrefixlessPath(pathname)) navigate(`${pathname}${rest}${hash}`, { replace: true });
    else goToLocale(code, rest);
  }, [search, enabled, locale, pathname, hash, navigate, goToLocale]);

  // <html lang dir> follow the resolved locale (§8.3).
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [locale, direction]);

  const toPath = useCallback((to: string) => localePath(to, locale, defaultLocale), [locale, defaultLocale]);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, direction, defaultLocale, locales, setLocale, toPath }),
    [locale, direction, defaultLocale, locales, setLocale, toPath],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
