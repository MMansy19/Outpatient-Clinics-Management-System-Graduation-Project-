import { offlineDb, type OfflinePatient } from './db';

/**
 * Normalize a name string for offline search: lowercased + Arabic/Latin
 * diacritics stripped + collapsed whitespace.
 */
export function normalizeSearchText(s: string | null | undefined): string {
  if (!s) return '';
  return s
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // Latin combining marks
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // Arabic tashkeel
    .replace(/[إأآا]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/** Coerce any backend `id` (number, string, undefined) to a stable string key. */
function toStringId(v: unknown): string | null {
  if (v === null || v === undefined || v === '') return null;
  return String(v);
}

/** Map any patient-shaped object from the backend to the offline row shape. */
function toOfflinePatient(raw: Record<string, unknown>): OfflinePatient | null {
  const id = toStringId(raw.id ?? raw.global_id);
  if (!id) return null;

  // Backend variants:
  //  - doctor: { id: number, name, socialSecurityNumber, ... }
  //  - super-admin list: { id: string, user: { firstName, lastName, socialSecurityNumber, ... }, address, job }
  //  - super-admin search: { id: string, name, socialSecurityNumber, ... }
  const user = (raw.user as Record<string, unknown> | undefined) ?? undefined;
  const firstName = (user?.firstName as string | undefined) ?? (raw.firstName as string | undefined);
  const lastName = (user?.lastName as string | undefined) ?? (raw.lastName as string | undefined);
  const composedName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const name = (raw.name as string | undefined) || composedName || '';

  const row: OfflinePatient = {
    id,
    global_id: (raw.global_id as string | undefined) ?? undefined,
    socialSecurityNumber:
      (raw.socialSecurityNumber as string | undefined) ??
      (user?.socialSecurityNumber as string | undefined),
    name,
    _searchName: normalizeSearchText(name),
    gender: (raw.gender as string | undefined) ?? (user?.gender as string | undefined),
    dateOfBirth:
      (raw.dateOfBirth as string | undefined) ?? (user?.dateOfBirth as string | undefined),
    address: (raw.address as string | undefined) ?? undefined,
    job: (raw.job as string | undefined) ?? undefined,
    phone_number: (raw.phone_number as string | undefined) ?? (raw.phone as string | undefined),
    email: (raw.email as string | undefined) ?? (user?.email as string | undefined),
    created_at: (raw.created_at as string | undefined) ?? (raw.createdAt as string | undefined),
    updated_at: (raw.updated_at as string | undefined) ?? (raw.updatedAt as string | undefined),
    _cachedAt: Date.now(),
  };

  return row;
}

const MAX_PATIENT_ROWS = 5000;

/**
 * Write-through helper: persist one or more patient records to
 * `offlineDb.patients`. Safe to call even when records have inconsistent
 * shapes — incompatible rows are skipped.
 */
export async function upsertPatients(records: unknown): Promise<number> {
  if (!records) return 0;
  const list = Array.isArray(records) ? records : [records];
  const rows: OfflinePatient[] = [];
  for (const r of list) {
    if (!r || typeof r !== 'object') continue;
    const mapped = toOfflinePatient(r as Record<string, unknown>);
    if (mapped) rows.push(mapped);
  }
  if (rows.length === 0) return 0;

  await offlineDb.patients.bulkPut(rows);

  // Cap the cache; evict oldest by `_cachedAt`.
  const total = await offlineDb.patients.count();
  if (total > MAX_PATIENT_ROWS) {
    const overflow = total - MAX_PATIENT_ROWS;
    const stale = await offlineDb.patients
      .orderBy('_cachedAt')
      .limit(overflow)
      .primaryKeys();
    if (stale.length) {
      await offlineDb.patients.bulkDelete(stale);
    }
  }

  return rows.length;
}

export async function wipePatients(): Promise<void> {
  await offlineDb.patients.clear();
}

export async function getPatientById(id: string | number): Promise<OfflinePatient | undefined> {
  const key = toStringId(id);
  if (!key) return undefined;
  return offlineDb.patients.get(key);
}

export async function getPatientBySSN(ssn: string): Promise<OfflinePatient | undefined> {
  if (!ssn) return undefined;
  return offlineDb.patients.where('socialSecurityNumber').equals(ssn).first();
}
