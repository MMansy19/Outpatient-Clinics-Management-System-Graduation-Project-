/**
 * Thrown by the offline preflight when a create-patient / create-doctor
 * payload would collide with an existing local record or an in-flight
 * queued create. Caught by dialogs to surface a localized toast and keep
 * the form open instead of optimistically closing.
 */
export class DuplicateError extends Error {
  readonly entity: 'patient' | 'doctor';
  readonly field: 'socialSecurityNumber' | 'email';
  readonly existing?: { id?: string; name?: string };
  /** Source of the conflict: a cached row (CACHE) or another pending mutation (QUEUE). */
  readonly source: 'cache' | 'queue';

  constructor(
    entity: 'patient' | 'doctor',
    field: 'socialSecurityNumber' | 'email',
    source: 'cache' | 'queue',
    existing?: { id?: string; name?: string },
  ) {
    super(`${entity} already exists (${field})`);
    this.name = 'DuplicateError';
    this.entity = entity;
    this.field = field;
    this.source = source;
    this.existing = existing;
  }
}

export function isDuplicateError(err: unknown): err is DuplicateError {
  return (
    err instanceof DuplicateError ||
    (typeof err === 'object' && err !== null && (err as { name?: string }).name === 'DuplicateError')
  );
}
