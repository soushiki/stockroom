import { HttpErrorResponse } from '@angular/common/http';

import { ApiError } from './models';

export function errorMessage(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Something went wrong. Try again.';
  }

  if (error.status === 0) {
    return 'Cannot reach the server. Check that the API is running on port 8080.';
  }

  const body = error.error as Partial<ApiError> | null;
  if (!body?.message) {
    return 'Something went wrong. Try again.';
  }

  const details = Object.entries(body.errors ?? {})
    .map(([field, message]) => `${field}: ${message}`)
    .join('. ');

  return details ? `${body.message}. ${details}` : body.message;
}
