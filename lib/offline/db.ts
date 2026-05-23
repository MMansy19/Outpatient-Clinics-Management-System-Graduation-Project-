import Dexie, { type EntityTable } from 'dexie';

// ============================================================================
// Types for offline storage
// ============================================================================

export interface OfflinePatient {
  id: number;
  global_id?: string;
  socialSecurityNumber?: string;
  name: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  job?: string;
  phone_number?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
  _cachedAt: number; // timestamp when cached
}

export interface OfflineVisit {
  id: number;
  global_id: string;
  patient_id: number;
  doctor_id: number;
  clinic_id: number;
  chief_complaint: string;
  history_present_illness?: string;
  vitals: Record<string, unknown>;
  physical_examination?: string;
  diagnosis: string;
  diagnosesAudioUrl?: string;
  treatment_plan?: string;
  notes?: string;
  follow_up_date?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  _cachedAt: number;
}

export interface OfflineMedication {
  id: number;
  global_id: string;
  patient_id: number;
  doctor_id: number;
  name: string;
  dosage: string;
  period: string;
  comments?: string | null;
  commentsAudioUrl?: string | null;
  is_deleted: boolean;
  created_at: string;
  _cachedAt: number;
}

export interface OfflineLab {
  id: number;
  global_id: string;
  patient_id: number;
  doctor_id: number;
  name: string;
  test_date: string;
  result_url?: string;
  comments?: string;
  commentsAudioUrl?: string;
  is_deleted: boolean;
  created_at: string;
  _cachedAt: number;
}

export interface OfflineScan {
  id: number;
  global_id: string;
  patient_id: number;
  doctor_id: number;
  name: string;
  type: string;
  photoUrl?: string;
  comments?: string | null;
  commentsAudioUrl?: string | null;
  is_deleted: boolean;
  created_at: string;
  _cachedAt: number;
}

export type MutationStatus = 'pending' | 'syncing' | 'failed' | 'synced';
export type MutationType =
  // Doctor-scoped (existing)
  | 'createVisit'
  | 'createMedication'
  | 'createLab'
  | 'createScan'
  | 'createPatient'
  | 'updateVisit'
  | 'updateMedication'
  | 'updateLab'
  | 'updateScan'
  | 'deleteVisit'
  | 'deleteMedication'
  | 'deleteLab'
  | 'deleteScan'
  // Super-admin-scoped
  | 'createClinic'
  | 'updateClinic'
  | 'deleteClinic'
  | 'createDoctor'
  | 'updateDoctor'
  | 'deleteDoctor'
  | 'updatePatient'
  | 'superAdminCreateVisit'
  | 'superAdminUpdateVisit'
  | 'superAdminCreateMedication'
  | 'superAdminUpdateMedication'
  | 'superAdminCreateLab'
  | 'superAdminUpdateLab'
  | 'superAdminCreateScan'
  | 'superAdminUpdateScan';

export interface QueuedMutation {
  autoId?: number;
  clientTempId: string;
  type: MutationType;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: Record<string, unknown>;
  /** Serialized blobs stored separately in blobStore */
  blobKeys?: string[];
  status: MutationStatus;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  userId?: string;
  patientId?: string;
  patientName?: string;
  createdAt: number;
  lastAttemptAt?: number;
}

export interface BlobEntry {
  key: string;
  data: Blob;
  mimeType: string;
  fileName: string;
  createdAt: number;
}

export interface SyncMeta {
  key: string;
  value: string;
  updatedAt: number;
}

// ============================================================================
// Database definition
// ============================================================================

class MediStreamOfflineDB extends Dexie {
  patients!: EntityTable<OfflinePatient, 'id'>;
  visits!: EntityTable<OfflineVisit, 'id'>;
  medications!: EntityTable<OfflineMedication, 'id'>;
  labs!: EntityTable<OfflineLab, 'id'>;
  scans!: EntityTable<OfflineScan, 'id'>;
  mutationQueue!: EntityTable<QueuedMutation, 'autoId'>;
  blobStore!: EntityTable<BlobEntry, 'key'>;
  syncMeta!: EntityTable<SyncMeta, 'key'>;

  constructor() {
    super('medistream-offline');

    this.version(1).stores({
      patients: 'id, global_id, socialSecurityNumber, name, _cachedAt',
      visits: 'id, global_id, patient_id, doctor_id, created_at, _cachedAt',
      medications: 'id, global_id, patient_id, created_at, _cachedAt',
      labs: 'id, global_id, patient_id, created_at, _cachedAt',
      scans: 'id, global_id, patient_id, created_at, _cachedAt',
      mutationQueue: '++autoId, clientTempId, type, status, createdAt, patientId',
      blobStore: 'key, createdAt',
      syncMeta: 'key',
    });
  }
}

export const offlineDb = new MediStreamOfflineDB();

// ============================================================================
// Helpers
// ============================================================================

/** Clear all patient-related data (on logout) */
export async function clearAllOfflineData(): Promise<void> {
  await Promise.all([
    offlineDb.patients.clear(),
    offlineDb.visits.clear(),
    offlineDb.medications.clear(),
    offlineDb.labs.clear(),
    offlineDb.scans.clear(),
    offlineDb.mutationQueue.clear(),
    offlineDb.blobStore.clear(),
    offlineDb.syncMeta.clear(),
  ]);
}

/** Delete cached data older than maxAge (ms). Default 7 days. */
export async function evictStaleData(maxAge = 7 * 24 * 60 * 60 * 1000): Promise<void> {
  const cutoff = Date.now() - maxAge;
  await Promise.all([
    offlineDb.patients.where('_cachedAt').below(cutoff).delete(),
    offlineDb.visits.where('_cachedAt').below(cutoff).delete(),
    offlineDb.medications.where('_cachedAt').below(cutoff).delete(),
    offlineDb.labs.where('_cachedAt').below(cutoff).delete(),
    offlineDb.scans.where('_cachedAt').below(cutoff).delete(),
  ]);
}
