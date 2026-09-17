import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Must be called in an injection context.
 *
 * Routes are prerendered at build time: API data fetched on the server would be frozen into the
 * HTML transfer cache. Stores therefore only fetch in the browser, where data is always live.
 */
export function injectIsBrowser(): boolean {
  return isPlatformBrowser(inject(PLATFORM_ID));
}
