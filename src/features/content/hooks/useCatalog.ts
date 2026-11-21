import { useCallback, useMemo } from 'react';
import { useLocale } from '@/i18n/useLocale';
import { useCollection } from './useContent';

// Display names of the shared reference data (C:countries, C:portfolios, C:us_hubs) by key, for
// screens that hold only keys (portal, admin). "Diaspora Engagement · Impact 100" = portfolio · flagship.
const ALL = 100;

export function useCatalog() {
  const { locale } = useLocale();
  const countries = useCollection({ collection: 'countries', limit: ALL }, locale);
  const portfolios = useCollection({ collection: 'portfolios', limit: ALL }, locale);
  const hubs = useCollection({ collection: 'us_hubs', limit: ALL }, locale);

  const names = useMemo(() => {
    const pick = (entries: Array<{ key: string; fields: Record<string, unknown> }> | undefined, field: string) =>
      new Map((entries ?? []).map((e) => [e.key, typeof e.fields[field] === 'string' ? (e.fields[field] as string) : e.key]));
    return {
      countries: pick(countries.data?.entries, 'name'),
      portfolios: pick(portfolios.data?.entries, 'name'),
      flagships: pick(portfolios.data?.entries, 'flagship'),
      hubs: pick(hubs.data?.entries, 'name'),
      countryList: (countries.data?.entries ?? []).map((e) => e.key),
      portfolioList: (portfolios.data?.entries ?? []).map((e) => e.key),
      hubList: (hubs.data?.entries ?? []).map((e) => e.key),
    };
  }, [countries.data, portfolios.data, hubs.data]);

  const country = useCallback((key: string | null | undefined) => (key ? (names.countries.get(key) ?? key) : ''), [names]);
  const hub = useCallback((key: string | null | undefined) => (key ? (names.hubs.get(key) ?? key) : ''), [names]);
  const portfolio = useCallback(
    (key: string | null | undefined) => (key ? `${names.portfolios.get(key) ?? key} · ${names.flagships.get(key) ?? ''}` : ''),
    [names],
  );
  return { country, hub, portfolio, countryKeys: names.countryList, portfolioKeys: names.portfolioList, hubKeys: names.hubList };
}
