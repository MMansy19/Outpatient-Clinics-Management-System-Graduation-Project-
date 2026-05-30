/**
 * Cache freshness helpers. Used by UI to decide whether to render a "Cached"
 * indicator or a "Fresh" state without a pill.
 */

/** Default TTL after which cached data is considered stale. 5 minutes. */
export const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

export function isStaleCache(cachedAt: number | undefined | null, ttlMs: number = DEFAULT_CACHE_TTL_MS): boolean {
  if (!cachedAt) return true;
  return Date.now() - cachedAt > ttlMs;
}
