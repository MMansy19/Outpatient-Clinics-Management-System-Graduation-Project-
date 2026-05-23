import { clearAllOfflineData, evictStaleData } from './db';
import { del } from 'idb-keyval';

const RQ_IDB_KEY = 'medistream-react-query-cache';

/**
 * Full cleanup — call on user logout.
 * Wipes all offline caches including IndexedDB tables and React Query persist cache.
 */
export async function cleanupOnLogout(): Promise<void> {
  await clearAllOfflineData();
  await del(RQ_IDB_KEY);
}

/**
 * Evict stale cached data — call periodically or on app init.
 * Removes patient/clinical data older than maxAge but keeps the mutation queue intact.
 */
export async function cleanupStaleData(maxAge?: number): Promise<void> {
  await evictStaleData(maxAge);
}
