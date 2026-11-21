import type { AdminCampaign, CharterValues, SettingsChange, SettingsVersion } from '@/domain/entities/admin.types';
import { AdminError, CAMPAIGN_GOAL_CENTS, campaignEndFor, canDecide, charterValuesValid, checkNewCampaign, diffValues } from '@/domain/rules/admin';
import { activeCharterValues, charterSettingsMockStore, promoteDueVersions } from '@/features/membership/api/charterSettingsStore';
import { mockResponse } from '@/infrastructure/api/mock';
import { CHAPTER } from '../fixtures/chapter';
import { actor, adminMockStore, recordAudit, today } from './adminMockStore';
import { demoDelta } from './chapterFigures';

// Charter rules (backend §4.7 admin campaigns, settings, settings changes, approve / reject,
// settings history). Contract for INT-4 + the mock: one active campaign with the fixed $100,000
// goal; every settings change needs a second admin and becomes a version from its effective date.
export interface CharterRepository {
  campaigns(): Promise<AdminCampaign[]>;
  createCampaign(input: { name: string; startsOn: string; grantsNote: string }): Promise<AdminCampaign>;
  settings(): Promise<{ version: SettingsVersion; values: CharterValues }>;
  proposeSettings(input: { values: CharterValues; effectiveFrom: string }): Promise<SettingsChange>;
  approvals(): Promise<SettingsChange[]>;
  approve(id: string): Promise<void>;
  reject(id: string): Promise<void>;
  history(): Promise<SettingsVersion[]>;
}

/** Campaigns move on by date: a planned one starts, an ended one goes to history. */
function byDate(campaigns: AdminCampaign[]): AdminCampaign[] {
  const now = today();
  return campaigns.map((c) => {
    if (c.status !== 'HISTORY' && c.endsOn < now) return { ...c, status: 'HISTORY' };
    if (c.status === 'PLANNED' && c.startsOn <= now) return { ...c, status: 'ACTIVE' };
    return c;
  });
}

const versions = () => promoteDueVersions(charterSettingsMockStore.read().versions);
const label = (change: SettingsChange) => change.summary ?? change.diff.map((d) => `${d.field} ${d.from} → ${d.to}`).join(' · ');

export const mockCharterRepository: CharterRepository = {
  campaigns: () =>
    mockResponse(() => {
      const received = CHAPTER.receivedCents + demoDelta().receivedCents;
      return byDate(adminMockStore.read().campaigns).map((c) => (c.status === 'ACTIVE' && c.slug === '2026-27' ? { ...c, raisedCents: received } : c));
    }),
  createCampaign: ({ name, startsOn, grantsNote }) =>
    mockResponse(() => {
      checkNewCampaign(byDate(adminMockStore.read().campaigns), startsOn);
      const campaign: AdminCampaign = {
        slug: `${startsOn.slice(0, 4)}-${String(Number(startsOn.slice(2, 4)) + 1).padStart(2, '0')}`,
        name: name.trim(),
        startsOn,
        endsOn: campaignEndFor(startsOn),
        goalCents: CAMPAIGN_GOAL_CENTS,
        raisedCents: 0,
        grants: grantsNote.split('\n').filter((line) => line.trim()).length,
        grantsNote: grantsNote.trim(),
        status: 'PLANNED',
      };
      adminMockStore.mutate((db) => void db.campaigns.unshift(campaign));
      recordAudit({ action: 'campaign.created', entity: `Campaign · ${campaign.name}` });
      return campaign;
    }),
  settings: () =>
    mockResponse(() => {
      const version = versions().find((v) => v.status === 'ACTIVE') ?? versions()[0];
      return { version, values: activeCharterValues() };
    }),
  proposeSettings: ({ values, effectiveFrom }) =>
    mockResponse(() => {
      if (!charterValuesValid(values) || !/^\d{4}-\d{2}-\d{2}$/.test(effectiveFrom)) throw new AdminError('SETTINGS_INVALID');
      const diff = diffValues(activeCharterValues(), values);
      if (diff.length === 0) throw new AdminError('SETTINGS_UNCHANGED');
      const who = actor();
      const change: SettingsChange = {
        id: `sc-${Date.now().toString(36)}`,
        summary: null,
        diff,
        proposedBy: who.id ?? '',
        proposedByName: who.name,
        effectiveFrom,
        status: 'PENDING',
        decidedBy: null,
        decidedByName: null,
      };
      charterSettingsMockStore.mutate((db) => void db.changes.unshift(change));
      recordAudit({ action: 'settings.proposed', entity: `Charter settings · ${label(change)}`, after: label(change) });
      return change;
    }),
  approvals: () => mockResponse(() => charterSettingsMockStore.read().changes.filter((c) => c.status === 'PENDING')),
  approve: (id) =>
    mockResponse(() => {
      const who = actor();
      const change = charterSettingsMockStore.read().changes.find((c) => c.id === id);
      if (!change) throw new AdminError('NOT_FOUND');
      if (!canDecide(change, who.id)) throw new AdminError('OWN_CHANGE');
      charterSettingsMockStore.mutate((db) => {
        const c = db.changes.find((x) => x.id === id);
        if (c) Object.assign(c, { status: 'APPROVED', decidedBy: who.id, decidedByName: who.name });
        const highest = db.versions.reduce((max, v) => {
          const n = Number(v.version?.replace(/^v/, '') ?? 0);
          return n > max ? n : max;
        }, 0);
        const version: SettingsVersion = {
          id: `v-${Date.now().toString(36)}`,
          version: `v${(highest + 0.1).toFixed(1)}`,
          change: change.summary ?? '',
          diff: change.diff,
          proposedByName: change.proposedByName,
          approvedByName: who.name,
          activeFrom: change.effectiveFrom,
          status: 'SCHEDULED',
          values: null,
        };
        db.versions = promoteDueVersions([version, ...db.versions]);
      });
      recordAudit({ action: 'settings.approved', entity: `Charter settings · ${label(change)}`, after: label(change) });
    }),
  reject: (id) =>
    mockResponse(() => {
      const who = actor();
      const change = charterSettingsMockStore.read().changes.find((c) => c.id === id);
      if (!change) throw new AdminError('NOT_FOUND');
      if (!canDecide(change, who.id)) throw new AdminError('OWN_CHANGE');
      charterSettingsMockStore.mutate((db) => {
        const c = db.changes.find((x) => x.id === id);
        if (c) Object.assign(c, { status: 'REJECTED', decidedBy: who.id, decidedByName: who.name });
        db.versions.unshift({ id: `v-rej-${Date.now().toString(36)}`, version: null, change: change.summary ?? '', diff: change.diff, proposedByName: change.proposedByName, approvedByName: null, activeFrom: null, status: 'REJECTED', values: null });
      });
      recordAudit({ action: 'settings.rejected', entity: `Charter settings · ${label(change)}`, before: label(change) });
    }),
  history: () => mockResponse(() => versions()),
};

/** The charter repository of the configured data source (INT-4 adds the HTTP implementation). */
export const charterRepository: CharterRepository = mockCharterRepository;
