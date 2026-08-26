import { offlineDb, type OfflinePatient, type QueuedMutation } from './db';
import { normalizeSearchText } from './patientCache';

export interface OfflineSearchResult<T> {
  patients: T[];
  total: number;
  pendingCount: number;
  source: 'offline';
}

/** Synthesize an OfflinePatient view from a queued createPatient mutation row. */
function pendingToOfflinePatient(m: QueuedMutation): OfflinePatient | null {
  const p = (m.payload ?? {}) as Record<string, unknown>;
  const firstName = (p.firstName as string | undefined) ?? '';
  const lastName = (p.lastName as string | undefined) ?? '';
  const name = `${firstName} ${lastName}`.trim() || (m.patientName ?? '');
  const ssn = (p.socialSecurityNumber as string | undefined) ?? undefined;

  return {
    // Use clientTempId so React keys stay stable and downstream code can
    // detect "this is a pending row" via the `__pending` flag below.
    id: m.clientTempId,
    socialSecurityNumber: ssn,
    name,
    _searchName: normalizeSearchText(name),
    gender: p.gender as string | undefined,
    dateOfBirth: p.birthdate as string | undefined,
    address: p.address as string | undefined,
    job: p.job as string | undefined,
    _cachedAt: m.createdAt ?? Date.now(),
    // The flag is read by UI to render a "Pending sync" badge.
    ...({ __pending: true } as Record<string, unknown>),
  } as OfflinePatient & { __pending: true };
}

/** Get pending createPatient rows, optionally filtered by SSN or free-text query. */
export async function getPendingPatientCreates(filter?: {
  ssn?: string;
  query?: string;
}): Promise<(OfflinePatient & { __pending: true })[]> {
  const rows = await offlineDb.mutationQueue
    .where('type')
    .equals('createPatient')
    .toArray();
  const active = rows.filter((r) => r.status !== 'failed');

  const ssn = filter?.ssn?.trim();
  const q = filter?.query ? normalizeSearchText(filter.query) : '';

  const mapped = active
    .map(pendingToOfflinePatient)
    .filter((p): p is OfflinePatient & { __pending: true } => p !== null);

  return mapped.filter((p) => {
    if (ssn && p.socialSecurityNumber !== ssn) return false;
    if (q && !(p._searchName ?? '').includes(q)) return false;
    return true;
  });
}

/**
 * Search cached patients by free-text query. Digit-only inputs are matched
 * as exact SSN; otherwise the query is tokenized and matched against the
 * normalized `_searchName` index using a substring AND-filter.
 */
export async function searchPatientsByQuery(
  query: string,
  opts: { limit?: number } = {},
): Promise<OfflineSearchResult<OfflinePatient & { __pending?: boolean }>> {
  const limit = opts.limit ?? 100;
  const raw = (query ?? '').trim();
  const isDigits = /^\d+$/.test(raw);

  let cached: OfflinePatient[] = [];

  if (!raw) {
    cached = await offlineDb.patients.orderBy('_cachedAt').reverse().limit(limit).toArray();
  } else if (isDigits) {
    const exact = await offlineDb.patients
      .where('socialSecurityNumber')
      .equals(raw)
      .toArray();
    cached = exact;
  } else {
    const norm = normalizeSearchText(raw);
    const tokens = norm.split(' ').filter(Boolean);
    // Pull a candidate window using the leading token, then in-memory AND-filter.
    const lead = tokens[0] ?? norm;
    const candidates = await offlineDb.patients
      .filter((p) => {
        const target = p._searchName ?? normalizeSearchText(p.name);
        if (!target) return false;
        if (!target.includes(lead)) return false;
        return tokens.every((tk) => target.includes(tk));
      })
      .limit(limit)
      .toArray();
    cached = candidates;
  }

  const pending = await getPendingPatientCreates({
    ssn: isDigits ? raw : undefined,
    query: !isDigits ? raw : undefined,
  });

  // Merge: pending first (most recent intent), de-duped by SSN.
  const seenSsn = new Set<string>();
  const merged: (OfflinePatient & { __pending?: boolean })[] = [];
  for (const p of pending) {
    if (p.socialSecurityNumber) seenSsn.add(p.socialSecurityNumber);
    merged.push(p);
  }
  for (const c of cached) {
    if (c.socialSecurityNumber && seenSsn.has(c.socialSecurityNumber)) continue;
    merged.push(c);
  }

  return {
    patients: merged.slice(0, limit),
    total: merged.length,
    pendingCount: pending.length,
    source: 'offline',
  };
}

/**
 * Look up a single cached patient by exact SSN. Returns the synthesized
 * pending-mutation row if no cached row exists but a create is queued.
 */
export async function searchPatientByNationalId(
  ssn: string,
): Promise<(OfflinePatient & { __pending?: boolean }) | null> {
  const trimmed = (ssn ?? '').trim();
  if (!trimmed) return null;

  const cached = await offlineDb.patients
    .where('socialSecurityNumber')
    .equals(trimmed)
    .first();
  if (cached) return cached;

  const pending = await getPendingPatientCreates({ ssn: trimmed });
  return pending[0] ?? null;
}
