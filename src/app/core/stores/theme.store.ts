import { Injectable, inject, PLATFORM_ID, signal, computed, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeMode } from '../models/theme.model';

@Injectable({
  providedIn: 'root',
})
export class ThemeStore {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly STORAGE_KEY = 'zero_bench_theme';

  readonly mode = signal<ThemeMode>(this.getInitialTheme());
  readonly isDark = computed(() => this.mode() === 'dark');

  constructor() {
    // Synchronize DOM with theme state
    effect(() => {
      const currentMode = this.mode();
      if (this.isBrowser) {
        localStorage.setItem(this.STORAGE_KEY, currentMode);
        const root = document.documentElement;
        if (currentMode === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    });
  }

  toggleTheme(): void {
    this.mode.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  setTheme(mode: ThemeMode): void {
    this.mode.set(mode);
  }

  private getInitialTheme(): ThemeMode {
    if (!this.isBrowser) {
      return 'light';
    }

    const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}
