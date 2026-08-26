import { offlineDb, type OfflineMedication, type QueuedMutation } from './db';

const MAX_MEDS_PER_PATIENT = 500;

export function toOfflineMedication(raw: Record<string, unknown>, patientIdHint?: string | number): OfflineMedication | null {
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
    name: (raw.name as string | undefined) ?? '',
    dosage: (raw.dosage as string | undefined) ?? '',
    period: (raw.period as string | undefined) ?? '',
    comments: (raw.comments as string | null | undefined) ?? null,
    commentsAudioUrl: (raw.commentsAudioUrl as string | null | undefined) ?? null,
    is_deleted: Boolean(raw.is_deleted),
    created_at: (raw.created_at as string | undefined) ?? (raw.createdAt as string | undefined) ?? new Date().toISOString(),
    _cachedAt: Date.now(),
  };
}

export async function upsertMedications(records: unknown, patientIdHint?: string | number): Promise<number> {
  if (!records) return 0;
  let list: unknown[];
  if (Array.isArray(records)) {
    list = records;
  } else if (typeof records === 'object') {
    const r = records as Record<string, unknown>;
    list = Array.isArray(r.medications) ? r.medications : [records];
  } else {
    return 0;
  }

  const rows: OfflineMedication[] = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const mapped = toOfflineMedication(item as Record<string, unknown>, patientIdHint);
    if (mapped) rows.push(mapped);
  }
  if (rows.length === 0) return 0;

  await offlineDb.medications.bulkPut(rows);

  if (patientIdHint !== undefined) {
    const pid = typeof patientIdHint === 'number' ? patientIdHint : Number(patientIdHint);
    if (!Number.isNaN(pid)) {
      const count = await offlineDb.medications.where('patient_id').equals(pid).count();
      if (count > MAX_MEDS_PER_PATIENT) {
        const overflow = count - MAX_MEDS_PER_PATIENT;
        const stale = await offlineDb.medications.where('patient_id').equals(pid).sortBy('_cachedAt');
        const toDelete = stale.slice(0, overflow).map((r) => r.id);
        if (toDelete.length) await offlineDb.medications.bulkDelete(toDelete);
      }
    }
  }

  return rows.length;
}

export async function getMedicationsByPatient(patientId: string | number): Promise<OfflineMedication[]> {
  const pid = typeof patientId === 'number' ? patientId : Number(patientId);
  if (Number.isNaN(pid)) return [];
  return offlineDb.medications.where('patient_id').equals(pid).reverse().sortBy('created_at');
}

export async function getMedicationById(id: string | number): Promise<OfflineMedication | undefined> {
  const numId = typeof id === 'number' ? id : Number(id);
  if (!Number.isNaN(numId)) {
    const byId = await offlineDb.medications.get(numId);
    if (byId) return byId;
  }
  return offlineDb.medications.where('global_id').equals(String(id)).first();
}

export function pendingToOfflineMedication(m: QueuedMutation): (OfflineMedication & { __pending: true }) | null {
  if (m.type !== 'createMedication' && m.type !== 'superAdminCreateMedication') return null;
  const p = m.payload ?? {};
  const patientId = Number(p.patientId ?? p.patient_id ?? m.patientId ?? 0);
  if (Number.isNaN(patientId)) return null;
  return {
    id: -Math.abs(Number(m.autoId ?? Date.now())),
    global_id: m.clientTempId,
    patient_id: patientId,
    doctor_id: Number(p.doctorId ?? p.doctor_id ?? 0),
    name: (p.name as string | undefined) ?? '',
    dosage: (p.dosage as string | undefined) ?? '',
    period: (p.period as string | undefined) ?? '',
    comments: (p.comments as string | null | undefined) ?? null,
    is_deleted: false,
    created_at: new Date(m.createdAt).toISOString(),
    _cachedAt: m.createdAt,
    __pending: true,
  } as OfflineMedication & { __pending: true };
}

export async function getPendingMedicationCreates(patientId?: string | number): Promise<(OfflineMedication & { __pending: true })[]> {
  const rows = await offlineDb.mutationQueue.where('type').equals('createMedication').toArray();
  const active = rows.filter((r) => r.status !== 'failed');
  const pid = patientId !== undefined ? String(patientId) : undefined;
  const mapped = active
    .map(pendingToOfflineMedication)
    .filter((v): v is OfflineMedication & { __pending: true } => v !== null);
  if (!pid) return mapped;
  return mapped.filter((v) => String(v.patient_id) === pid);
}
