/**
 * Tiny in-memory TTL cache.
 *
 * Why we need this: many platforms rate-limit automated requests
 * (Instagram 429s, Hacker News 429s, etc.). Re-probing the same
 * (platform, username) pair within a short window:
 *   1. Almost always returns the same result
 *   2. Burns through the rate limit faster
 *   3. Slows down the UX for repeat searches
 *
 * A 5-minute TTL is a good tradeoff: long enough to absorb accidental
 * double-clicks and short back-to-back searches, short enough that a
 * user who just created an account and re-checks will see it appear.
 *
 * NOTE: This is per-process. In a multi-instance deploy you'd want
 * Redis or similar, but for the sandbox this is fine.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ENTRIES = 2000; // cap to avoid unbounded growth

const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number = DEFAULT_TTL_MS): void {
  // If we're at capacity, evict the oldest entries first.
  if (store.size >= MAX_ENTRIES) {
    const now = Date.now();
    // First pass: drop expired.
    for (const [k, v] of store) {
      if (now > v.expiresAt) store.delete(k);
    }
    // Still over capacity? Drop ~10% of the oldest remaining.
    if (store.size >= MAX_ENTRIES) {
      const sorted = Array.from(store.entries()).sort(
        (a, b) => a[1].expiresAt - b[1].expiresAt,
      );
      const toRemove = Math.floor(MAX_ENTRIES * 0.1);
      for (let i = 0; i < toRemove; i++) {
        store.delete(sorted[i][0]);
      }
    }
  }
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function cacheStats() {
  return {
    size: store.size,
    maxEntries: MAX_ENTRIES,
    ttlMs: DEFAULT_TTL_MS,
  };
}
