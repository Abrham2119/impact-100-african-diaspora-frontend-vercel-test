// Mock transport for the public-site services until their backends exist (Steps 8–12, wired in
// Step 13). A service builds the documented response shape and returns it through here, so callers
// see real async behaviour (pending states, latency) and the swap to `apiClient` stays local to
// the service file.
const DEFAULT_LATENCY_MS = 300;

export function mockResponse<T>(produce: () => T, latencyMs = DEFAULT_LATENCY_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(produce());
      } catch (error) {
        reject(error);
      }
    }, latencyMs);
  });
}

/** A short, unique-enough reference like the services issue ("CT-4F7K2Q"). */
export function mockReference(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
