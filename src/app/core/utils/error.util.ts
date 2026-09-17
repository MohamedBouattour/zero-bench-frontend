import { HttpErrorResponse } from '@angular/common/http';

/**
 * Extracts a human readable message from an HTTP or runtime error.
 * The mock server (and the future backend) answers errors as `{ "error": "..." }`.
 */
export function toErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const body: unknown = err.error;
    if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
      return body.error;
    }
    return err.status === 0 ? 'Unable to reach the server' : fallback;
  }
  return err instanceof Error ? err.message : fallback;
}
