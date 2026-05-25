import { offlineDb, type OfflineDoctor } from './db';
import { normalizeSearchText } from './patientCache';

function toStringId(v: unknown): string | null {
  if (v === null || v === undefined || v === '') return null;
  return String(v);
}

function toOfflineDoctor(raw: Record<string, unknown>): OfflineDoctor | null {
  const id = toStringId(raw.id ?? raw.global_id);
  if (!id) return null;

  const user = (raw.user as Record<string, unknown> | undefined) ?? undefined;
  const firstName = (user?.firstName as string | undefined) ?? (raw.firstName as string | undefined);
  const lastName = (user?.lastName as string | undefined) ?? (raw.lastName as string | undefined);
  const composedName = [firstName, lastName].filter(Boolean).join(' ').trim();
  const name = (raw.name as string | undefined) || composedName || '';

  const row: OfflineDoctor = {
    id,
    global_id: (raw.global_id as string | undefined) ?? undefined,
    socialSecurityNumber:
      (raw.socialSecurityNumber as string | undefined) ??
      (user?.socialSecurityNumber as string | undefined),
    email: (raw.email as string | undefined) ?? (user?.email as string | undefined),
    firstName,
    lastName,
    name: name || undefined,
    _searchName: normalizeSearchText(name),
    phone: (raw.phone as string | undefined) ?? (raw.phone_number as string | undefined),
    speciality: (raw.speciality as string | undefined) ?? undefined,
    clinicId:
      (raw.clinicId as string | undefined) ??
      (raw.clinic_id as string | undefined) ??
      ((raw.clinic as { id?: string } | undefined)?.id),
    created_at: (raw.created_at as string | undefined) ?? (raw.createdAt as string | undefined),
    _cachedAt: Date.now(),
  };

  return row;
}

const MAX_DOCTOR_ROWS = 2000;

export async function upsertDoctors(records: unknown): Promise<number> {
  if (!records) return 0;
  const list = Array.isArray(records) ? records : [records];
  const rows: OfflineDoctor[] = [];
  for (const r of list) {
    if (!r || typeof r !== 'object') continue;
    const mapped = toOfflineDoctor(r as Record<string, unknown>);
    if (mapped) rows.push(mapped);
  }
  if (rows.length === 0) return 0;

  await offlineDb.doctors.bulkPut(rows);

  const total = await offlineDb.doctors.count();
  if (total > MAX_DOCTOR_ROWS) {
    const overflow = total - MAX_DOCTOR_ROWS;
    const stale = await offlineDb.doctors
      .orderBy('_cachedAt')
      .limit(overflow)
      .primaryKeys();
    if (stale.length) {
      await offlineDb.doctors.bulkDelete(stale);
    }
  }

  return rows.length;
}

export async function wipeDoctors(): Promise<void> {
  await offlineDb.doctors.clear();
}

export async function getDoctorBySSN(ssn: string): Promise<OfflineDoctor | undefined> {
  if (!ssn) return undefined;
  return offlineDb.doctors.where('socialSecurityNumber').equals(ssn).first();
}

export async function getDoctorByEmail(email: string): Promise<OfflineDoctor | undefined> {
  if (!email) return undefined;
  return offlineDb.doctors.where('email').equalsIgnoreCase(email).first();
}
