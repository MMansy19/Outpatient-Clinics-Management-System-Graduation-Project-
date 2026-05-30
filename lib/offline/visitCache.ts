import { offlineDb, type OfflineVisit, type QueuedMutation } from './db';

/** Per-patient row cap; older rows by `_cachedAt` are evicted past this. */
const MAX_VISITS_PER_PATIENT = 500;

/** Map any visit-shaped object from the backend to the offline row shape. */
export function toOfflineVisit(raw: Record<string, unknown>, patientIdHint?: string | number): OfflineVisit | null {
  const id = (raw.id as number | undefined) ?? Number(raw.id);
  if (id === undefined || Number.isNaN(id) || id === null) return null;

  const patientId =
    (raw.patient_id as number | undefined) ??
    (raw.patientId as number | undefined) ??
    (typeof patientIdHint === 'number' ? patientIdHint : Number(patientIdHint));
  if (patientId === undefined || Number.isNaN(patientId)) return null;

  return {
    id,
    global_id: (raw.global_id as string | undefined) ?? String(raw.id ?? ''),
    patient_id: patientId,
    doctor_id: (raw.doctor_id as number | undefined) ?? (raw.doctorId as number | undefined) ?? 0,
    clinic_id: (raw.clinic_id as number | undefined) ?? (raw.clinicId as number | undefined) ?? 0,
    chief_complaint: (raw.chief_complaint as string | undefined) ?? '',
    history_present_illness: raw.history_present_illness as string | undefined,
    vitals: (raw.vitals as Record<string, unknown> | undefined) ?? {},
    physical_examination: raw.physical_examination as string | undefined,
    diagnosis: (raw.diagnosis as string | undefined) ?? (raw.diagnoses as string | undefined) ?? '',
    diagnosesAudioUrl: raw.diagnosesAudioUrl as string | undefined,
    treatment_plan: raw.treatment_plan as string | undefined,
    notes: raw.notes as string | undefined,
    follow_up_date: raw.follow_up_date as string | undefined,
    is_deleted: Boolean(raw.is_deleted),
    created_at: (raw.created_at as string | undefined) ?? (raw.createdAt as string | undefined) ?? new Date().toISOString(),
    updated_at: (raw.updated_at as string | undefined) ?? (raw.updatedAt as string | undefined) ?? new Date().toISOString(),
    _cachedAt: Date.now(),
  };
}

/**
 * Write-through helper. Accepts a single visit, an array, or a wrapped
 * response (e.g. `{ visits: [...] }` or `{ clinics: [{ visits: [...] }] }`).
 */
export async function upsertVisits(records: unknown, patientIdHint?: string | number): Promise<number> {
  if (!records) return 0;

  // Normalize to a flat array.
  let list: unknown[];
  if (Array.isArray(records)) {
    list = records;
  } else if (typeof records === 'object') {
    const r = records as Record<string, unknown>;
    if (Array.isArray(r.visits)) {
      list = r.visits;
    } else if (Array.isArray(r.clinics)) {
      list = (r.clinics as Array<Record<string, unknown>>).flatMap((c) => (Array.isArray(c.visits) ? c.visits : []));
    } else {
      list = [records];
    }
  } else {
    return 0;
  }

  const rows: OfflineVisit[] = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const mapped = toOfflineVisit(item as Record<string, unknown>, patientIdHint);
    if (mapped) rows.push(mapped);
  }
  if (rows.length === 0) return 0;

  await offlineDb.visits.bulkPut(rows);

  // Per-patient eviction.
  if (patientIdHint !== undefined) {
    const pid = typeof patientIdHint === 'number' ? patientIdHint : Number(patientIdHint);
    if (!Number.isNaN(pid)) {
      const count = await offlineDb.visits.where('patient_id').equals(pid).count();
      if (count > MAX_VISITS_PER_PATIENT) {
        const overflow = count - MAX_VISITS_PER_PATIENT;
        const stale = await offlineDb.visits
          .where('patient_id')
          .equals(pid)
          .sortBy('_cachedAt');
        const toDelete = stale.slice(0, overflow).map((r) => r.id);
        if (toDelete.length) await offlineDb.visits.bulkDelete(toDelete);
      }
    }
  }

  return rows.length;
}

export async function getVisitsByPatient(patientId: string | number): Promise<OfflineVisit[]> {
  const pid = typeof patientId === 'number' ? patientId : Number(patientId);
  if (Number.isNaN(pid)) return [];
  return offlineDb.visits.where('patient_id').equals(pid).reverse().sortBy('created_at');
}

export async function getVisitById(id: string | number): Promise<OfflineVisit | undefined> {
  const numId = typeof id === 'number' ? id : Number(id);
  if (!Number.isNaN(numId)) {
    const byId = await offlineDb.visits.get(numId);
    if (byId) return byId;
  }
  // Fall back to global_id lookup.
  const idStr = String(id);
  return offlineDb.visits.where('global_id').equals(idStr).first();
}

export async function wipeVisitsForPatient(patientId: string | number): Promise<void> {
  const pid = typeof patientId === 'number' ? patientId : Number(patientId);
  if (Number.isNaN(pid)) return;
  await offlineDb.visits.where('patient_id').equals(pid).delete();
}

/** Synthesize an OfflineVisit row from a queued createVisit mutation. */
export function pendingToOfflineVisit(m: QueuedMutation): (OfflineVisit & { __pending: true }) | null {
  if (m.type !== 'createVisit' && m.type !== 'superAdminCreateVisit') return null;
  const p = m.payload ?? {};
  const patientId = Number(p.patientId ?? p.patient_id ?? m.patientId ?? 0);
  if (Number.isNaN(patientId)) return null;
  return {
    id: -Math.abs(Number(m.autoId ?? Date.now())), // negative to avoid collisions
    global_id: m.clientTempId,
    patient_id: patientId,
    doctor_id: Number(p.doctorId ?? p.doctor_id ?? 0),
    clinic_id: Number(p.clinicId ?? p.clinic_id ?? 0),
    chief_complaint: (p.chief_complaint as string | undefined) ?? '',
    vitals: (p.vitals as Record<string, unknown> | undefined) ?? {},
    diagnosis: (p.diagnosis as string | undefined) ?? (p.diagnoses as string | undefined) ?? '',
    is_deleted: false,
    created_at: new Date(m.createdAt).toISOString(),
    updated_at: new Date(m.createdAt).toISOString(),
    _cachedAt: m.createdAt,
    __pending: true,
  } as OfflineVisit & { __pending: true };
}

export async function getPendingVisitCreates(patientId?: string | number): Promise<(OfflineVisit & { __pending: true })[]> {
  const rows = await offlineDb.mutationQueue.where('type').equals('createVisit').toArray();
  const active = rows.filter((r) => r.status !== 'failed');
  const pid = patientId !== undefined ? String(patientId) : undefined;
  const mapped = active
    .map(pendingToOfflineVisit)
    .filter((v): v is OfflineVisit & { __pending: true } => v !== null);
  if (!pid) return mapped;
  return mapped.filter((v) => String(v.patient_id) === pid);
}
