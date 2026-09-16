import { InjectionToken, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => {
    const platformId = inject(PLATFORM_ID);
    if (isPlatformBrowser(platformId)) {
      // In the browser, relative URL delegates to the Angular dev proxy or production reverse proxy
      return '';
    }
    // On the Node.js SSR server, use loopback or environment variable
    return (typeof process !== 'undefined' && process.env?.['API_URL']) || 'http://127.0.0.1:3001';
  },
});
