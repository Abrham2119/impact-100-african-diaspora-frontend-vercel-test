import type { TFunction } from '@/i18n/useT';

// Display name of a charter level (UiStrings `site.level.<key>`), shared by the campaign chips and
// the join wizard. Keys come from the charter settings; an unknown key shows as-is.
const LEVEL_KEYS = ['initiator', 'incubator', 'innovator', 'investor'] as const;
type LevelKey = (typeof LEVEL_KEYS)[number];
const isLevelKey = (key: string): key is LevelKey => (LEVEL_KEYS as readonly string[]).includes(key);

export function levelName(t: TFunction<'site'>, key: string): string {
  return isLevelKey(key) ? t(`level.${key}`) : key;
}
