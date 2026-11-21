import type { AuditEntry, ExportRecord } from '@/domain/entities/admin.types';

// Recent exports (admin_exports.dc.html) and the audit log (admin_audit / admin_audit_entry
// .dc.html), verbatim. Every admin action of the demo adds an audit entry on top.
export const EXPORTS: ExportRecord[] = [
  { id: 'ex-3', dataset: 'PAYMENTS', requestedBy: 'USAFI finance · A. Diallo', rows: 412, createdAt: '2026-11-17T09:12', expired: false, csv: null },
  { id: 'ex-2', dataset: 'SIGNUPS', requestedBy: 'Atlanta co-Ambassador', rows: 14, createdAt: '2026-11-16T18:40', expired: false, csv: null },
  { id: 'ex-1', dataset: 'MEMBERS', requestedBy: 'Kofi Boateng', rows: 126, createdAt: '2026-11-12T11:03', expired: true, csv: null },
];

// Seeded hashes are the chain as the server keeps it (sample; admin_audit_entry shows #48213's as
// "9f2c…a71e"); entries added in the demo are hashed and linked by `recordAudit`.
const entry = (e: Omit<AuditEntry, 'before' | 'after' | 'subjectId' | 'actorId' | 'actorRole'> & Partial<AuditEntry>): AuditEntry => ({
  actorId: null,
  actorRole: null,
  subjectId: null,
  before: null,
  after: null,
  ...e,
});

export const AUDIT: AuditEntry[] = [
  entry({ id: '48215', at: '2026-11-18T10:14', actorId: 'u-kofi', actorName: 'Kofi Boateng', actorRole: 'CHAPTER_ADMIN', action: 'role.granted', entity: 'Person · Amara Mensah', subjectId: 'u-amara', hash: 'c41b7e2a90d35f6c18e4a7b2d90f3e15', prevHash: '5e8d21c7a4f09b3e6d1c8a2f7b40e9d3' }),
  entry({ id: '48214', at: '2026-11-17T16:02', actorId: 'u-aisha', actorName: 'Aisha Diallo', actorRole: 'USAFI_FINANCE', action: 'payment.offline_recorded', entity: 'Payment · $300', subjectId: 'u-david', hash: '5e8d21c7a4f09b3e6d1c8a2f7b40e9d3', prevHash: '9f2c84d1b6e03a7f52c9e1d84b0fa71e' }),
  entry({
    id: '48213',
    at: '2026-11-17T11:40',
    actorId: 'u-ngozi',
    actorName: 'Ngozi Eze',
    actorRole: 'CHAPTER_ADMIN',
    action: 'comment.hidden',
    entity: 'Comment on Proposal #12',
    entityDetail: 'Comment #331 on “Youth digital skills programme”',
    hash: '9f2c84d1b6e03a7f52c9e1d84b0fa71e',
    prevHash: '2a7f9c03e5d1b84f6c2e0a9d71b3f58c',
    before: 'visible · “This partner has a poor track record — avoid.” (posted by D. Otieno, Initiator)',
    after: 'hidden · reason: personal attack, against discussion guidelines',
  }),
  entry({ id: '48212', at: '2026-11-16T09:00', actorName: 'System', action: 'ballot.closed', entity: 'Ballot · AGM online', hash: '2a7f9c03e5d1b84f6c2e0a9d71b3f58c', prevHash: 'e06b3d9f2c7a15e84b9d0c3f6a2e81b7' }),
  entry({ id: '48211', at: '2026-11-15T18:21', actorId: 'u-kofi', actorName: 'Kofi Boateng', actorRole: 'CHAPTER_ADMIN', action: 'export.created', entity: 'Members · 126 rows', hash: 'e06b3d9f2c7a15e84b9d0c3f6a2e81b7', prevHash: null }),
];
