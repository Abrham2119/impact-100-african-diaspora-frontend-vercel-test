import type { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { useLocale } from '@/i18n/useLocale';

// Guards the `/:lang` public mount (decision F2): only enabled, non-default locales are valid
// prefixes (`/en/about` is not — English has no prefix). Anything else is the 404 page.
export function LocaleGate({ children, notFound }: { children: ReactNode; notFound: ReactNode }) {
  const { lang } = useParams();
  const { locales, defaultLocale } = useLocale();
  const valid = lang !== undefined && lang !== defaultLocale && locales.some((l) => l.code === lang);
  return <>{valid ? children : notFound}</>;
}
