import { HttpContextToken } from '@angular/common/http';

/**
 * Context token allowing specific HTTP requests to bypass the global loading indicator.
 * Usage: `http.get('/api/...', { context: new HttpContext().set(SKIP_LOADING, true) })`
 */
export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

export interface LoadingState {
  activeRequests: number;
  isLoading: boolean;
}
