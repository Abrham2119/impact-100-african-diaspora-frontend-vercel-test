import { useCallback } from 'react';
import { useUiStrings } from '@/features/content/hooks/useContent';
import type { UiKey, UiNamespace } from '@/features/content/fixtures/en/ui';
import { useLocale } from './useLocale';

// UiString lookup (ARCHITECTURE.md §8.4). The server applies the fallback chain; as a client
// safety net a key missing from the locale bundle is read from the default-locale bundle,
// and if it is still missing the key itself renders (with one dev warning).
// Interpolation: t('shell.sideMenu', { group: 'Voting' }) → "Voting menu".

export type TFunction<N extends UiNamespace> = (key: UiKey<N>, vars?: Record<string, string | number>) => string;

const warned = new Set<string>();

function interpolate(text: string, vars?: Record<string, string | number>): string {
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in vars ? String(vars[name]) : match));
}

export function useT<N extends UiNamespace>(namespace: N): TFunction<N> {
  const { locale, defaultLocale } = useLocale();
  const { data: bundle } = useUiStrings(namespace, locale);
  const { data: fallback } = useUiStrings(namespace, defaultLocale);

  return useCallback<TFunction<N>>(
    (key, vars) => {
      const text = bundle?.[key] ?? fallback?.[key];
      if (text === undefined) {
        const id = `${namespace}.${key}`;
        if (import.meta.env.DEV && !warned.has(id)) {
          warned.add(id);
          console.warn(`[i18n] missing UiString "${id}"`);
        }
        return key;
      }
      return interpolate(text, vars);
    },
    [bundle, fallback, namespace],
  );
}
