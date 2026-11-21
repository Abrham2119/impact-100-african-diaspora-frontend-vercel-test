import type { CharterValues, SettingsVersion } from '@/domain/entities/admin.types';
import { createMockStore } from '@/infrastructure/mock/mockStore';
import { SETTINGS_CHANGES, SETTINGS_VERSIONS, V1_VALUES } from '../fixtures/charterSettings';

// The versioned charter settings of the mock data layer. A change proposed by one admin and approved
// by another becomes a version from its effective date; until then it is scheduled. The active
// version's numbers are what every rule reads (settingsService). (Part B: membership service.)
export const charterSettingsMockStore = createMockStore('charter-settings', () => ({ versions: SETTINGS_VERSIONS, changes: SETTINGS_CHANGES }));

const today = () => new Date().toISOString().slice(0, 10);

/** Scheduled versions whose date has come become active (the previous one is superseded). */
export function promoteDueVersions(versions: SettingsVersion[]): SettingsVersion[] {
  const due = versions
    .filter((v) => v.status === 'SCHEDULED' && v.activeFrom !== null && v.activeFrom <= today())
    .sort((a, b) => (a.activeFrom ?? '').localeCompare(b.activeFrom ?? ''));
  if (due.length === 0) return versions;
  const latest = due[due.length - 1];
  return versions.map((v) => {
    if (v.id === latest.id) return { ...v, status: 'ACTIVE' };
    if (v.status === 'ACTIVE' || (v.status === 'SCHEDULED' && due.includes(v))) return { ...v, status: 'SUPERSEDED' };
    return v;
  });
}

/**
 * The numbers in force today: the adopted charter (v1.0) with every approved change whose
 * effective date has come applied in date order — so changes approved in any order combine.
 */
export function activeCharterValues(): CharterValues {
  const now = today();
  return charterSettingsMockStore
    .read()
    .versions.filter((v) => v.diff && v.status !== 'REJECTED' && v.activeFrom !== null && v.activeFrom <= now)
    .sort((a, b) => (a.activeFrom ?? '').localeCompare(b.activeFrom ?? ''))
    .reduce<CharterValues>((values, v) => (v.diff ?? []).reduce((acc, d) => ({ ...acc, [d.field]: d.to }), values), { ...V1_VALUES });
}
