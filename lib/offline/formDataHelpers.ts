/**
 * Helpers for serializing FormData into the offline-queue shape
 * ({ payload, blobs }) used by `useOfflineMutation`.
 *
 * Text entries → payload (Record<string, string>)
 * File/Blob entries → blobs[] (uploaded as multipart on replay)
 */

export interface OfflineBlob {
  fieldName: string;
  blob: Blob;
  fileName: string;
  mimeType: string;
}

export interface SplitFormData {
  payload: Record<string, unknown>;
  blobs: OfflineBlob[];
}

export function splitFormData(fd: FormData): SplitFormData {
  const payload: Record<string, unknown> = {};
  const blobs: OfflineBlob[] = [];

  fd.forEach((value, key) => {
    if (typeof File !== 'undefined' && value instanceof File) {
      blobs.push({
        fieldName: key,
        blob: value,
        fileName: value.name || `${key}.bin`,
        mimeType: value.type || 'application/octet-stream',
      });
    } else if (value instanceof Blob) {
      blobs.push({
        fieldName: key,
        blob: value,
        fileName: `${key}.bin`,
        mimeType: value.type || 'application/octet-stream',
      });
    } else {
      payload[key] = value;
    }
  });

  return { payload, blobs };
}

/**
 * Extract a plain-text payload from either FormData or a plain object.
 * Strips File/Blob fields. Always safe to JSON.stringify.
 */
export function toPayload(input: unknown): Record<string, unknown> {
  if (typeof FormData !== 'undefined' && input instanceof FormData) {
    return splitFormData(input).payload;
  }
  if (input && typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if (typeof File !== 'undefined' && v instanceof File) continue;
      if (v instanceof Blob) continue;
      out[k] = v;
    }
    return out;
  }
  return {};
}

/**
 * Extract blobs from either FormData or a plain object that may contain
 * a single `image`/`audio` File field.
 */
export function toBlobs(input: unknown): OfflineBlob[] {
  if (typeof FormData !== 'undefined' && input instanceof FormData) {
    return splitFormData(input).blobs;
  }
  if (input && typeof input === 'object') {
    const out: OfflineBlob[] = [];
    for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
      if (typeof File !== 'undefined' && v instanceof File) {
        out.push({ fieldName: k, blob: v, fileName: v.name || `${k}.bin`, mimeType: v.type || 'application/octet-stream' });
      } else if (v instanceof Blob) {
        out.push({ fieldName: k, blob: v, fileName: `${k}.bin`, mimeType: (v as Blob).type || 'application/octet-stream' });
      }
    }
    return out;
  }
  return [];
}
