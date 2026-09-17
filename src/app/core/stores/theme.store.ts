import { Injectable, computed, effect, signal } from '@angular/core';
import { ThemeMode } from '../models/theme.model';
import { injectIsBrowser } from '../utils/platform.util';

@Injectable({
  providedIn: 'root',
})
export class ThemeStore {
  private readonly isBrowser = injectIsBrowser();
  private readonly STORAGE_KEY = 'zero_bench_theme';

  readonly mode = signal<ThemeMode>(this.getInitialTheme());
  readonly isDark = computed(() => this.mode() === 'dark');

  constructor() {
    // Persist the preference (localStorage for the anti-flash script, cookie for future SSR use)
    effect(() => {
      const currentMode = this.mode();
      if (this.isBrowser) {
        localStorage.setItem(this.STORAGE_KEY, currentMode);
        document.cookie = `${this.STORAGE_KEY}=${currentMode}; path=/; max-age=31536000; SameSite=Lax`;
        this.applyDomTheme(currentMode);
      }
    });
  }

  toggleTheme(): void {
    this.setTheme(this.mode() === 'light' ? 'dark' : 'light');
  }

  setTheme(mode: ThemeMode): void {
    // Apply synchronously so the switch is instant, the effect then persists it.
    this.applyDomTheme(mode);
    this.mode.set(mode);
  }

  private applyDomTheme(mode: ThemeMode): void {
    if (!this.isBrowser) return;
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    root.style.colorScheme = mode;
  }

  private getInitialTheme(): ThemeMode {
    if (!this.isBrowser) {
      return 'light';
    }

    // First check if already applied by the anti-flash script in <head>
    if (document.documentElement.classList.contains('dark')) {
      return 'dark';
    }

    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
