import type { AuditEntry, ExportDataset, ExportRecord } from '@/domain/entities/admin.types';
import { AdminError } from '@/domain/rules/admin';
import { governanceRepository } from '@/features/governance/api/governanceRepository';
import { ledgerMockStore } from '@/features/membership/api/ledgerStore';
import { mockResponse } from '@/infrastructure/api/mock';
import { HUB_SIGNUPS } from '../fixtures/chapter';
import { actor, adminMockStore, auditMockStore, nowStamp, recordAudit } from './adminMockStore';
import { peopleRepository } from './peopleRepository';

// Exports (backend §4.7 admin exports) and the audit log (backend §4.1 permissions/audit). Contract
// for INT-4 + the mock: a CSV of the chosen dataset (filtered by dates), logged with who asked and
// how many rows. Individual vote choices are never exportable (results are tallies only).
export interface ExportsRepository {
  list(): Promise<ExportRecord[]>;
  create(input: { dataset: ExportDataset; from: string | null; to: string | null }): Promise<ExportRecord>;
  /** the file of an export that hasn't expired */
  download(id: string): Promise<string>;
}
export interface AuditRepository {
  list(): Promise<AuditEntry[]>;
  entry(id: string): Promise<AuditEntry | null>;
}

const csvOf = (rows: Array<Array<string | number>>) => rows.map((cells) => cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
const inRange = (date: string, from: string | null, to: string | null) => (!from || date >= from) && (!to || date <= to);

async function datasetRows(dataset: ExportDataset, from: string | null, to: string | null): Promise<Array<Array<string | number>>> {
  const ledger = ledgerMockStore.read().entries.filter((e) => inRange(e.date, from, to));
  switch (dataset) {
    case 'MEMBERS': {
      const people = await peopleRepository.list();
      return [['name', 'email', 'hub', 'roles', 'level', 'voting'], ...people.map((p) => [p.fullName, p.email, p.usHubKey ?? '', p.grants.map((g) => g.role).join(' '), p.levelKey ?? '', p.votingEligible ? 'yes' : 'no'])];
    }
    case 'PAYMENTS':
      return [['date', 'person', 'for', 'amount_cents', 'source', 'reference', 'status'], ...ledger.map((e) => [e.date, e.personName, e.kind, e.amountCents, e.source, e.reference ?? e.recordedBy ?? '', e.status])];
    case 'DONATIONS':
      return [['date', 'person', 'country', 'portfolio', 'amount_cents', 'status'], ...ledger.filter((e) => e.kind === 'DONATION').map((e) => [e.date, e.personName, e.countryKey ?? '', e.portfolioKey ?? '', e.amountCents, e.status])];
    case 'SIGNUPS':
      return [['date', 'name', 'type', 'role', 'status'], ...HUB_SIGNUPS.filter((s) => inRange(s.date, from, to)).map((s) => [s.date, s.name, s.type, s.role ?? '', s.status])];
    case 'RESULTS': {
      const { votes } = await governanceRepository.results();
      return [['vote', 'eligible', 'yes', 'no', 'abstain', 'published'], ...votes.map((v) => [v.title, v.eligible, v.yes, v.no, v.abstain, v.publishedOn])];
    }
    default:
      throw new AdminError('NOT_FOUND');
  }
}

export const mockExportsRepository: ExportsRepository = {
  list: () => mockResponse(() => adminMockStore.read().exports),
  create: async ({ dataset, from, to }) => {
    const rows = await datasetRows(dataset, from, to);
    return mockResponse(() => {
      const record: ExportRecord = {
        id: `ex-${Date.now().toString(36)}`,
        dataset,
        requestedBy: actor().name,
        rows: rows.length - 1,
        createdAt: nowStamp(),
        expired: false,
        csv: csvOf(rows),
      };
      adminMockStore.mutate((db) => void db.exports.unshift(record));
      recordAudit({ action: 'export.created', entity: `${dataset.charAt(0)}${dataset.slice(1).toLowerCase()} · ${record.rows} rows` });
      return record;
    });
  },
  download: async (id) => {
    const record = adminMockStore.read().exports.find((e) => e.id === id);
    if (!record || record.expired) throw new AdminError('NOT_FOUND');
    if (record.csv) return record.csv;
    const csv = csvOf(await datasetRows(record.dataset, null, null));
    return mockResponse(() => csv);
  },
};

export const mockAuditRepository: AuditRepository = {
  list: () => mockResponse(() => auditMockStore.read().entries),
  entry: (id) => mockResponse(() => auditMockStore.read().entries.find((e) => e.id === id) ?? null),
};

/** The exports and audit repositories of the configured data source (INT-4 adds the HTTP implementations). */
export const exportsRepository: ExportsRepository = mockExportsRepository;
export const auditRepository: AuditRepository = mockAuditRepository;
