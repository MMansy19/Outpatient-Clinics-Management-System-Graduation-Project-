import { offlineDb, type QueuedMutation } from './db';
import { DuplicateError } from './errors';
import { getPatientBySSN } from './patientCache';
import { getDoctorBySSN, getDoctorByEmail } from './doctorCache';

/**
 * Scan the mutation queue for non-failed createPatient rows that already
 * carry the given SSN. We exclude `failed` rows because the user can
 * discard those from the drawer; including them would block re-submission
 * after editing the SSN.
 */
async function findQueuedPatientBySSN(ssn: string, excludeAutoId?: number): Promise<QueuedMutation | undefined> {
  if (!ssn) return undefined;
  const rows = await offlineDb.mutationQueue
    .where('type')
    .equals('createPatient')
    .toArray();
  return rows.find(
    (r) =>
      r.status !== 'failed' &&
      r.autoId !== excludeAutoId &&
      typeof r.payload?.socialSecurityNumber === 'string' &&
      r.payload.socialSecurityNumber === ssn,
  );
}

async function findQueuedDoctorBy(
  field: 'socialSecurityNumber' | 'email',
  value: string,
  excludeAutoId?: number,
): Promise<QueuedMutation | undefined> {
  if (!value) return undefined;
  const rows = await offlineDb.mutationQueue
    .where('type')
    .equals('createDoctor')
    .toArray();
  const target = field === 'email' ? value.toLowerCase() : value;
  return rows.find((r) => {
    if (r.status === 'failed') return false;
    if (r.autoId === excludeAutoId) return false;
    const v = r.payload?.[field];
    if (typeof v !== 'string') return false;
    return field === 'email' ? v.toLowerCase() === target : v === target;
  });
}

/**
 * Throws DuplicateError when a patient with the supplied SSN already
 * exists in the offline cache or is awaiting sync.
 *
 * `excludeAutoId` lets the sync engine ignore the row it is currently
 * replaying, so it doesn't flag itself as a duplicate.
 */
export async function assertPatientUnique(params: { socialSecurityNumber?: string; excludeAutoId?: number }): Promise<void> {
  const ssn = (params.socialSecurityNumber ?? '').trim();
  if (!ssn) return;

  const cached = await getPatientBySSN(ssn);
  if (cached) {
    throw new DuplicateError('patient', 'socialSecurityNumber', 'cache', {
      id: cached.id,
      name: cached.name,
    });
  }

  const queued = await findQueuedPatientBySSN(ssn, params.excludeAutoId);
  if (queued) {
    throw new DuplicateError('patient', 'socialSecurityNumber', 'queue', {
      name: queued.patientName,
    });
  }
}

/**
 * Throws DuplicateError when a doctor with the supplied SSN or email
 * already exists in the offline cache or is awaiting sync.
 */
export async function assertDoctorUnique(params: { socialSecurityNumber?: string; email?: string; excludeAutoId?: number }): Promise<void> {
  const ssn = (params.socialSecurityNumber ?? '').trim();
  const email = (params.email ?? '').trim();

  if (ssn) {
    const cached = await getDoctorBySSN(ssn);
    if (cached) {
      throw new DuplicateError('doctor', 'socialSecurityNumber', 'cache', {
        id: cached.id,
        name: cached.name,
      });
    }
    const queued = await findQueuedDoctorBy('socialSecurityNumber', ssn, params.excludeAutoId);
    if (queued) {
      throw new DuplicateError('doctor', 'socialSecurityNumber', 'queue');
    }
  }

  if (email) {
    const cached = await getDoctorByEmail(email);
    if (cached) {
      throw new DuplicateError('doctor', 'email', 'cache', {
        id: cached.id,
        name: cached.name,
      });
    }
    const queued = await findQueuedDoctorBy('email', email, params.excludeAutoId);
    if (queued) {
      throw new DuplicateError('doctor', 'email', 'queue');
    }
  }
}
