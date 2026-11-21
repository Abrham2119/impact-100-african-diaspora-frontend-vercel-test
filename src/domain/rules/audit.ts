import type { AuditEntry } from '@/domain/entities/admin.types';

// The audit log is append-only and hash-chained (admin_audit.dc.html): each entry's hash covers its
// content and the previous entry's hash, so an edited or removed entry breaks the chain. Pure; the
// API keeps the real chain (SHA-256) in Part B — this is the mock's stand-in (four FNV-1a passes).

const fnv1a = (text: string, seed: number): string => {
  let h = seed >>> 0;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
};

/** The hash of an entry over its content and `prevHash` (32 hex characters). */
export function auditHash(entry: Omit<AuditEntry, 'hash'>): string {
  const body = [entry.prevHash ?? '', entry.id, entry.at, entry.actorName, entry.action, entry.entity, entry.subjectId ?? '', entry.before ?? '', entry.after ?? ''].join('␟');
  return [0x811c9dc5, 0x01234567, 0x89abcdef, 0x2545f491].map((seed) => fnv1a(body, seed)).join('');
}

/** Each entry (newest first) links to the one before it; the oldest has no predecessor. */
export const chainLinksHold = (entries: AuditEntry[]): boolean =>
  entries.every((entry, i) => entry.prevHash === (entries[i + 1]?.hash ?? null));

/** "9f2c…a71e" */
export const shortHash = (hash: string): string => `${hash.slice(0, 4)}…${hash.slice(-4)}`;
