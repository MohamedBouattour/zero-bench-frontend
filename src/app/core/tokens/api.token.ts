import { InjectionToken, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

/**
 * Normalizes an API base URL so that appending `/api/...` in services
 * never causes duplicate `/api/api` paths or trailing slashes.
 */
function normalizeBaseUrl(url: string | undefined): string {
  if (!url) return '';
  const trimmed = url.trim().replace(/\/+$/, '');
  if (trimmed.endsWith('/api')) {
    return trimmed.slice(0, -4);
  }
  return trimmed;
}

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => {
    const platformId = inject(PLATFORM_ID);
    const isBrowser = isPlatformBrowser(platformId);

    // 1. Browser runtime global override (e.g. window.__BENCHZERO_API_URL__)
    if (isBrowser && typeof window !== 'undefined') {
      const windowOverride = (window as unknown as { __BENCHZERO_API_URL__?: string }).__BENCHZERO_API_URL__;
      if (windowOverride) {
        return normalizeBaseUrl(windowOverride);
      }
    }

    // 2. Server runtime environment override (e.g. process.env['API_URL'] on Render SSR)
    if (!isBrowser && typeof process !== 'undefined' && process.env?.['API_URL']) {
      return normalizeBaseUrl(process.env['API_URL']);
    }

    // 3. Angular environment configuration (environment.apiUrl)
    if (typeof environment !== 'undefined' && environment.apiUrl !== undefined && environment.apiUrl !== '') {
      return normalizeBaseUrl(environment.apiUrl);
    }

    // 4. Fallbacks
    if (isBrowser) {
      // In the browser, relative URL delegates to the Angular dev proxy or local reverse proxy
      return '';
    }

    // On Node.js SSR server during local development
    return 'http://127.0.0.1:3001';
  },
});
