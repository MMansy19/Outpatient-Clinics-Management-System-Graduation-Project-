import { offlineDb, type OfflineLab, type QueuedMutation } from './db';

const MAX_LABS_PER_PATIENT = 500;

export function toOfflineLab(raw: Record<string, unknown>, patientIdHint?: string | number): OfflineLab | null {
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
    test_date: (raw.test_date as string | undefined) ?? (raw.testDate as string | undefined) ?? '',
    result_url: (raw.result_url as string | undefined) ?? (raw.resultUrl as string | undefined),
    comments: raw.comments as string | undefined,
    commentsAudioUrl: raw.commentsAudioUrl as string | undefined,
    is_deleted: Boolean(raw.is_deleted),
    created_at: (raw.created_at as string | undefined) ?? (raw.createdAt as string | undefined) ?? new Date().toISOString(),
    _cachedAt: Date.now(),
  };
}

export async function upsertLabs(records: unknown, patientIdHint?: string | number): Promise<number> {
  if (!records) return 0;
  let list: unknown[];
  if (Array.isArray(records)) {
    list = records;
  } else if (typeof records === 'object') {
    const r = records as Record<string, unknown>;
    list = Array.isArray(r.labs) ? r.labs : [records];
  } else {
    return 0;
  }

  const rows: OfflineLab[] = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const mapped = toOfflineLab(item as Record<string, unknown>, patientIdHint);
    if (mapped) rows.push(mapped);
  }
  if (rows.length === 0) return 0;

  await offlineDb.labs.bulkPut(rows);

  if (patientIdHint !== undefined) {
    const pid = typeof patientIdHint === 'number' ? patientIdHint : Number(patientIdHint);
    if (!Number.isNaN(pid)) {
      const count = await offlineDb.labs.where('patient_id').equals(pid).count();
      if (count > MAX_LABS_PER_PATIENT) {
        const overflow = count - MAX_LABS_PER_PATIENT;
        const stale = await offlineDb.labs.where('patient_id').equals(pid).sortBy('_cachedAt');
        const toDelete = stale.slice(0, overflow).map((r) => r.id);
        if (toDelete.length) await offlineDb.labs.bulkDelete(toDelete);
      }
    }
  }

  return rows.length;
}

export async function getLabsByPatient(patientId: string | number): Promise<OfflineLab[]> {
  const pid = typeof patientId === 'number' ? patientId : Number(patientId);
  if (Number.isNaN(pid)) return [];
  return offlineDb.labs.where('patient_id').equals(pid).reverse().sortBy('created_at');
}

export async function getLabById(id: string | number): Promise<OfflineLab | undefined> {
  const numId = typeof id === 'number' ? id : Number(id);
  if (!Number.isNaN(numId)) {
    const byId = await offlineDb.labs.get(numId);
    if (byId) return byId;
  }
  return offlineDb.labs.where('global_id').equals(String(id)).first();
}

export function pendingToOfflineLab(m: QueuedMutation): (OfflineLab & { __pending: true }) | null {
  if (m.type !== 'createLab' && m.type !== 'superAdminCreateLab') return null;
  const p = m.payload ?? {};
  const patientId = Number(p.patientId ?? p.patient_id ?? m.patientId ?? 0);
  if (Number.isNaN(patientId)) return null;
  return {
    id: -Math.abs(Number(m.autoId ?? Date.now())),
    global_id: m.clientTempId,
    patient_id: patientId,
    doctor_id: Number(p.doctorId ?? p.doctor_id ?? 0),
    name: (p.name as string | undefined) ?? '',
    test_date: (p.test_date as string | undefined) ?? (p.testDate as string | undefined) ?? new Date().toISOString(),
    comments: p.comments as string | undefined,
    is_deleted: false,
    created_at: new Date(m.createdAt).toISOString(),
    _cachedAt: m.createdAt,
    __pending: true,
  } as OfflineLab & { __pending: true };
}

export async function getPendingLabCreates(patientId?: string | number): Promise<(OfflineLab & { __pending: true })[]> {
  const rows = await offlineDb.mutationQueue.where('type').equals('createLab').toArray();
  const active = rows.filter((r) => r.status !== 'failed');
  const pid = patientId !== undefined ? String(patientId) : undefined;
  const mapped = active
    .map(pendingToOfflineLab)
    .filter((v): v is OfflineLab & { __pending: true } => v !== null);
  if (!pid) return mapped;
  return mapped.filter((v) => String(v.patient_id) === pid);
}
