// The saved language preference (ARCHITECTURE.md §8.1 step 3): the `i18n_locale` cookie,
// 1 year, SameSite=Lax. A cookie (not localStorage) so the server can read it later.
const COOKIE = 'i18n_locale';
const ONE_YEAR_S = 60 * 60 * 24 * 365;

export const localeStorage = {
  get: (): string | null => {
    const match = document.cookie.split('; ').find((part) => part.startsWith(`${COOKIE}=`));
    return match ? decodeURIComponent(match.slice(COOKIE.length + 1)) : null;
  },
  set: (code: string): void => {
    document.cookie = `${COOKIE}=${encodeURIComponent(code)}; Max-Age=${ONE_YEAR_S}; Path=/; SameSite=Lax`;
  },
};
