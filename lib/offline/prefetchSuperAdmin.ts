import type { QueryClient } from '@tanstack/react-query';
import { superAdminApi } from '@/lib/api/superAdmin.service';
import { offlineDb } from './db';

// ============================================================================
// Super-Admin Eager Prefetch
//
// After a super-admin logs in (or revisits the dashboard while online), we
// pull every list the dashboard depends on into React Query's cache so that
// the persisted IDB cache (`createIdbPersister`) has a complete snapshot for
// offline reads.
//
// Per-patient nested data (visits/medications/labs/scans) is prefetched
// lazily for the most-recently-active patients in batches of 10 to limit
// network pressure. The rest are still fetched on-demand when the admin
// opens a profile while online.
// ============================================================================

export interface PrefetchProgress {
  stage: 'lists' | 'patients' | 'done';
  processed: number;
  total: number;
}

export type PrefetchProgressListener = (p: PrefetchProgress) => void;

const SYNC_META_KEY = 'superAdmin.lastFullSyncAt';
const DEFAULT_PATIENT_BATCH = 10;
const DEFAULT_RECENT_PATIENT_LIMIT = 100;
const LIST_PAGE_LIMIT = 10000;
const QUERY_STALE_TIME = 5 * 60 * 1000;

interface PatientLite {
  id: string;
  createdAt?: string;
}

interface PrefetchOptions {
  /** Max number of recently-created patients to prefetch nested data for. */
  recentPatientLimit?: number;
  /** Number of patients to prefetch in parallel per batch. */
  batchSize?: number;
  /** Progress callback (UI overlay). */
  onProgress?: PrefetchProgressListener;
  /** Skip if last full sync happened more recently than this (ms). */
  freshnessMs?: number;
}

/**
 * Read the last full-sync timestamp from Dexie syncMeta.
 * Returns 0 when no record exists.
 */
export async function getLastFullSyncAt(): Promise<number> {
  try {
    const row = await offlineDb.syncMeta.get(SYNC_META_KEY);
    return row ? Number(row.value) || 0 : 0;
  } catch {
    return 0;
  }
}

async function setLastFullSyncAt(ts: number): Promise<void> {
  try {
    await offlineDb.syncMeta.put({ key: SYNC_META_KEY, value: String(ts), updatedAt: ts });
  } catch {
    // ignore — purely informational
  }
}

/**
 * Prefetch all super-admin dashboard data into the persisted React Query cache.
 * Safe to call while online; no-op when offline. Returns early when the cache
 * is already fresh (within `freshnessMs`).
 */
export async function prefetchSuperAdminData(
  queryClient: QueryClient,
  options: PrefetchOptions = {},
): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;

  const {
    recentPatientLimit = DEFAULT_RECENT_PATIENT_LIMIT,
    batchSize = DEFAULT_PATIENT_BATCH,
    onProgress,
    freshnessMs,
  } = options;

  if (typeof freshnessMs === 'number') {
    const last = await getLastFullSyncAt();
    if (last && Date.now() - last < freshnessMs) return;
  }

  const emit = (p: PrefetchProgress) => {
    try {
      onProgress?.(p);
    } catch {
      /* listener errors are non-fatal */
    }
  };

  // ── Top-level lists ──────────────────────────────────────────────────────
  emit({ stage: 'lists', processed: 0, total: 5 });

  const listJobs: Array<Promise<unknown>> = [
    queryClient.prefetchQuery({
      queryKey: ['clinics'],
      queryFn: () => superAdminApi.getClinics(),
      staleTime: QUERY_STALE_TIME,
    }),
    queryClient.prefetchQuery({
      queryKey: ['clinics-all'],
      queryFn: () => superAdminApi.getClinics({ includeDeleted: true }),
      staleTime: QUERY_STALE_TIME,
    }),
    queryClient.prefetchQuery({
      queryKey: ['doctors-all'],
      queryFn: () => superAdminApi.getDoctors({ page: 1, limit: LIST_PAGE_LIMIT }),
      staleTime: QUERY_STALE_TIME,
    }),
    queryClient.prefetchQuery({
      queryKey: ['patients-all'],
      queryFn: () => superAdminApi.getPatients({ page: 1, limit: LIST_PAGE_LIMIT }),
      staleTime: QUERY_STALE_TIME,
    }),
    queryClient.prefetchQuery({
      queryKey: ['visits-all'],
      queryFn: () => superAdminApi.getVisits({ page: 1, limit: LIST_PAGE_LIMIT }),
      staleTime: QUERY_STALE_TIME,
    }),
  ];

  await Promise.allSettled(listJobs);
  emit({ stage: 'lists', processed: 5, total: 5 });

  // ── Per-patient nested data (top N by createdAt desc) ────────────────────
  const patientsResp = queryClient.getQueryData<{ items?: PatientLite[] }>(['patients-all']);
  const patients = (patientsResp?.items ?? []).slice();

  patients.sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
  });

  const targetPatients = patients.slice(0, recentPatientLimit);
  const total = targetPatients.length;
  emit({ stage: 'patients', processed: 0, total });

  let processed = 0;
  for (let i = 0; i < targetPatients.length; i += batchSize) {
    if (typeof navigator !== 'undefined' && !navigator.onLine) break;

    const slice = targetPatients.slice(i, i + batchSize);
    await Promise.allSettled(
      slice.flatMap((p) => [
        queryClient.prefetchQuery({
          queryKey: ['super-admin-patient-visits', p.id],
          queryFn: () => superAdminApi.getPatientVisits(p.id),
          staleTime: QUERY_STALE_TIME,
        }),
        queryClient.prefetchQuery({
          queryKey: ['super-admin-patient-medications', p.id],
          queryFn: () => superAdminApi.getPatientMedications(p.id),
          staleTime: QUERY_STALE_TIME,
        }),
        queryClient.prefetchQuery({
          queryKey: ['super-admin-patient-labs', p.id],
          queryFn: () => superAdminApi.getPatientLabs(p.id),
          staleTime: QUERY_STALE_TIME,
        }),
        queryClient.prefetchQuery({
          queryKey: ['super-admin-patient-scans', p.id],
          queryFn: () => superAdminApi.getPatientScans(p.id),
          staleTime: QUERY_STALE_TIME,
        }),
      ]),
    );
    processed += slice.length;
    emit({ stage: 'patients', processed, total });
  }

  await setLastFullSyncAt(Date.now());
  emit({ stage: 'done', processed, total });
}
