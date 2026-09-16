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
        document.cookie = `${this.STORAGE_KEY}=${currentMode}; path=/; max-age=31536000; SameSite=Lax`;
        const root = document.documentElement;
        if (currentMode === 'dark') {
          root.classList.add('dark');
          root.style.colorScheme = 'dark';
        } else {
          root.classList.remove('dark');
          root.style.colorScheme = 'light';
        }
      }
    });
  }

  toggleTheme(): void {
    const nextMode: ThemeMode = this.mode() === 'light' ? 'dark' : 'light';
    this.applyDomTheme(nextMode);
    this.mode.set(nextMode);
  }

  setTheme(mode: ThemeMode): void {
    this.applyDomTheme(mode);
    this.mode.set(mode);
  }

  private applyDomTheme(mode: ThemeMode): void {
    if (!this.isBrowser) return;
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }

  private getInitialTheme(): ThemeMode {
    if (!this.isBrowser) {
      return 'light';
    }

    // First check if already applied by the anti-flash script in <head>
    if (document.documentElement.classList.contains('dark')) {
      return 'dark';
    }

    const saved = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }

    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
}
