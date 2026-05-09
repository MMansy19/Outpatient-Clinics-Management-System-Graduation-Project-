import type { PersistedClient, Persister } from '@tanstack/query-persist-client-core';
import { get, set, del } from 'idb-keyval';

const IDB_KEY = 'medistream-react-query-cache';

/**
 * IndexedDB-based persister for React Query.
 *
 * Uses idb-keyval for simplicity — stores the entire dehydrated cache
 * as a single value. This is sufficient for the data sizes in this app
 * (patient records, visits list, etc.).
 */
export function createIdbPersister(): Persister {
  return {
    persistClient: async (client: PersistedClient) => {
      await set(IDB_KEY, client);
    },
    restoreClient: async () => {
      return await get<PersistedClient>(IDB_KEY);
    },
    removeClient: async () => {
      await del(IDB_KEY);
    },
  };
}
