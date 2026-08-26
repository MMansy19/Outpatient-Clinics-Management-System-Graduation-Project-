import { offlineDb, type OfflineScan, type QueuedMutation } from './db';

const MAX_SCANS_PER_PATIENT = 500;

export function toOfflineScan(raw: Record<string, unknown>, patientIdHint?: string | number): OfflineScan | null {
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
    type: (raw.type as string | undefined) ?? '',
    photoUrl: raw.photoUrl as string | undefined,
    comments: (raw.comments as string | null | undefined) ?? null,
    commentsAudioUrl: (raw.commentsAudioUrl as string | null | undefined) ?? null,
    is_deleted: Boolean(raw.is_deleted),
    created_at: (raw.created_at as string | undefined) ?? (raw.createdAt as string | undefined) ?? new Date().toISOString(),
    _cachedAt: Date.now(),
  };
}

export async function upsertScans(records: unknown, patientIdHint?: string | number): Promise<number> {
  if (!records) return 0;
  let list: unknown[];
  if (Array.isArray(records)) {
    list = records;
  } else if (typeof records === 'object') {
    const r = records as Record<string, unknown>;
    list = Array.isArray(r.scans) ? r.scans : [records];
  } else {
    return 0;
  }

  const rows: OfflineScan[] = [];
  for (const item of list) {
    if (!item || typeof item !== 'object') continue;
    const mapped = toOfflineScan(item as Record<string, unknown>, patientIdHint);
    if (mapped) rows.push(mapped);
  }
  if (rows.length === 0) return 0;

  await offlineDb.scans.bulkPut(rows);

  if (patientIdHint !== undefined) {
    const pid = typeof patientIdHint === 'number' ? patientIdHint : Number(patientIdHint);
    if (!Number.isNaN(pid)) {
      const count = await offlineDb.scans.where('patient_id').equals(pid).count();
      if (count > MAX_SCANS_PER_PATIENT) {
        const overflow = count - MAX_SCANS_PER_PATIENT;
        const stale = await offlineDb.scans.where('patient_id').equals(pid).sortBy('_cachedAt');
        const toDelete = stale.slice(0, overflow).map((r) => r.id);
        if (toDelete.length) await offlineDb.scans.bulkDelete(toDelete);
      }
    }
  }

  return rows.length;
}

export async function getScansByPatient(patientId: string | number): Promise<OfflineScan[]> {
  const pid = typeof patientId === 'number' ? patientId : Number(patientId);
  if (Number.isNaN(pid)) return [];
  return offlineDb.scans.where('patient_id').equals(pid).reverse().sortBy('created_at');
}

export async function getScanById(id: string | number): Promise<OfflineScan | undefined> {
  const numId = typeof id === 'number' ? id : Number(id);
  if (!Number.isNaN(numId)) {
    const byId = await offlineDb.scans.get(numId);
    if (byId) return byId;
  }
  return offlineDb.scans.where('global_id').equals(String(id)).first();
}

export function pendingToOfflineScan(m: QueuedMutation): (OfflineScan & { __pending: true }) | null {
  if (m.type !== 'createScan' && m.type !== 'superAdminCreateScan') return null;
  const p = m.payload ?? {};
  const patientId = Number(p.patientId ?? p.patient_id ?? m.patientId ?? 0);
  if (Number.isNaN(patientId)) return null;
  return {
    id: -Math.abs(Number(m.autoId ?? Date.now())),
    global_id: m.clientTempId,
    patient_id: patientId,
    doctor_id: Number(p.doctorId ?? p.doctor_id ?? 0),
    name: (p.name as string | undefined) ?? '',
    type: (p.type as string | undefined) ?? '',
    comments: (p.comments as string | null | undefined) ?? null,
    is_deleted: false,
    created_at: new Date(m.createdAt).toISOString(),
    _cachedAt: m.createdAt,
    __pending: true,
  } as OfflineScan & { __pending: true };
}

export async function getPendingScanCreates(patientId?: string | number): Promise<(OfflineScan & { __pending: true })[]> {
  const rows = await offlineDb.mutationQueue.where('type').equals('createScan').toArray();
  const active = rows.filter((r) => r.status !== 'failed');
  const pid = patientId !== undefined ? String(patientId) : undefined;
  const mapped = active
    .map(pendingToOfflineScan)
    .filter((v): v is OfflineScan & { __pending: true } => v !== null);
  if (!pid) return mapped;
  return mapped.filter((v) => String(v.patient_id) === pid);
}
