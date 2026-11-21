import type { LedgerEntry } from '@/domain/entities/admin.types';
import { createMockStore } from '@/infrastructure/mock/mockStore';
import { LEDGER } from '../fixtures/ledger';

// The payments ledger of the mock data layer: every confirmed pledge payment and direct donation.
// The member repository adds WAZI payments as they confirm; the admin payments repository adds
// offline payments. (Part B: the membership service's ledger.)
export const ledgerMockStore = createMockStore('ledger', () => ({ entries: LEDGER }));

/** The next WAZIImpact.org reference after the highest one in the ledger (wz_88232, …). */
export function nextWaziReference(entries: LedgerEntry[]): string {
  const highest = entries.reduce((max, e) => Math.max(max, Number(e.reference?.match(/^wz_(\d+)$/)?.[1] ?? 0)), 0);
  return `wz_${highest + 1}`;
}

export function appendLedger(entry: Omit<LedgerEntry, 'id' | 'reference'> & { reference?: string | null }): LedgerEntry {
  let added: LedgerEntry | null = null;
  ledgerMockStore.mutate((db) => {
    const reference = entry.reference !== undefined ? entry.reference : entry.source === 'WAZI' ? nextWaziReference(db.entries) : null;
    added = { ...entry, reference, id: `pay-${Date.now().toString(36)}-${db.entries.length}` };
    db.entries.unshift(added);
  });
  return added as unknown as LedgerEntry;
}
