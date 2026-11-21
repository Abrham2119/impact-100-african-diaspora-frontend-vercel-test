// The persisted mock data layer of Part A (FE-3): every domain keeps its demo data in a mock store
// seeded from fixtures (the design's dummy data), persisted to localStorage so writes (payments,
// votes, signatures, profile edits…) survive reloads and show everywhere — portal now, admin later.
// `resetDemoData()` restores every store to its fixtures. Repositories are the only callers; the
// HTTP repositories of Part B replace them behind the same interfaces.
type Listener = () => void;

export interface MockStore<T> {
  read: () => T;
  /** apply a change, persist it, notify subscribers; returns the new state */
  mutate: (change: (draft: T) => void) => T;
  reset: () => void;
  subscribe: (listener: Listener) => () => void;
}

const registry: Array<MockStore<unknown>> = [];
/** bump when a fixture shape changes, so old saved demo data is dropped */
const VERSION = 1;

export function createMockStore<T>(name: string, seed: () => T): MockStore<T> {
  const key = `ix_mock:${name}:v${VERSION}`;
  const listeners = new Set<Listener>();
  let cache: T | null = null;

  const load = (): T => {
    if (cache) return cache;
    try {
      const raw = localStorage.getItem(key);
      cache = raw ? (JSON.parse(raw) as T) : seed();
    } catch {
      cache = seed();
    }
    return cache;
  };
  const persist = (state: T) => {
    cache = state;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // storage full or unavailable: the demo data lasts for this page only
    }
    listeners.forEach((listener) => listener());
  };

  const store: MockStore<T> = {
    read: () => structuredClone(load()),
    mutate: (change) => {
      const draft = structuredClone(load());
      change(draft);
      persist(draft);
      return structuredClone(draft);
    },
    reset: () => {
      cache = null;
      try {
        localStorage.removeItem(key);
      } catch {
        // nothing saved
      }
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  registry.push(store as MockStore<unknown>);
  return store;
}

/** Restores every mock store to its fixtures (the demo switcher's "reset demo data"). */
export function resetDemoData(): void {
  registry.forEach((store) => store.reset());
}
