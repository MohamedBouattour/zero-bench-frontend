import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeStore } from '../../stores/theme.store';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      (click)="toggleTheme()"
      class="p-2 text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-800 rounded-full transition-colors relative flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-secondary-blue/40"
      [attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
      [title]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
    >
      @if (isDark()) {
        <span class="material-symbols-outlined text-[20px] text-amber-400 animate-in spin-in-180 duration-200">
          light_mode
        </span>
      } @else {
        <span class="material-symbols-outlined text-[20px] text-slate-700 animate-in spin-in-180 duration-200">
          dark_mode
        </span>
      }
    </button>
  `,
})
export class ThemeToggleComponent {
  private readonly themeStore = inject(ThemeStore);

  readonly isDark = this.themeStore.isDark;

  toggleTheme(): void {
    this.themeStore.toggleTheme();
  }
}
