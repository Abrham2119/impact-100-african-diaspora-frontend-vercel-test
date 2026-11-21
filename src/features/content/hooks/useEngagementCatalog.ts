import { useCallback, useMemo } from 'react';
import { useLocale } from '@/i18n/useLocale';
import { useCatalog } from './useCatalog';
import { useCollection } from './useContent';

// Display names for the public forms' records (admin Engagement): contact topics, events and the
// volunteer roles with their team (C:contact_topics, C:events, C:volunteer_roles). A role's team is
// named as the admin tables name it: the committee ("Grants Selection"), the portfolio ("Academic
// Partnerships") or the hub ("Atlanta hub").
const ALL = 100;
const COMMITTEE_SUFFIX = '-committee';

export function useEngagementCatalog() {
  const { locale } = useLocale();
  const catalog = useCatalog();
  const topics = useCollection({ collection: 'contact_topics', limit: ALL }, locale);
  const events = useCollection({ collection: 'events', limit: ALL }, locale);
  const roles = useCollection({ collection: 'volunteer_roles', limit: ALL }, locale);

  const maps = useMemo(() => {
    const text = (value: unknown, fallback: string) => (typeof value === 'string' ? value : fallback);
    return {
      topics: new Map((topics.data?.entries ?? []).map((e) => [e.key, text(e.fields.name, e.key)])),
      events: new Map((events.data?.entries ?? []).map((e) => [e.key, text(e.fields.title, e.key)])),
      roles: new Map(
        (roles.data?.entries ?? []).map((e) => [
          e.key,
          { title: text(e.fields.title, e.key), team: text(e.fields.team, ''), area: text(e.data.area, ''), teamKey: text(e.data.team_key, ''), interestKey: text(e.data.interest_key, '') },
        ]),
      ),
    };
  }, [topics.data, events.data, roles.data]);

  const topic = useCallback((key: string | null | undefined) => (key ? (maps.topics.get(key) ?? key) : ''), [maps]);
  const event = useCallback((key: string | null | undefined) => (key ? (maps.events.get(key) ?? key) : ''), [maps]);
  const role = useCallback((key: string) => maps.roles.get(key), [maps]);
  const roleTitle = useCallback((key: string) => maps.roles.get(key)?.title ?? key, [maps]);
  const team = useCallback(
    (key: string) => {
      const r = maps.roles.get(key);
      if (!r) return key;
      if (r.area === 'usafi' && r.interestKey) return catalog.portfolioName(r.interestKey);
      if (r.area === 'chapter' && r.teamKey.endsWith(COMMITTEE_SUFFIX)) return catalog.committee(r.teamKey.slice(0, -COMMITTEE_SUFFIX.length));
      if (r.area === 'chapter') return catalog.committee(r.teamKey);
      return r.team;
    },
    [maps, catalog],
  );
  return { topic, event, role, roleTitle, team };
}
