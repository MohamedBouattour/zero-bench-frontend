import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeStore } from '../../stores/theme.store';

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let label = themeStore.isDark() ? 'Switch to light mode' : 'Switch to dark mode';
    <button
      type="button"
      (click)="themeStore.toggleTheme()"
      class="p-2 text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-800 rounded-full transition-colors relative flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-secondary-blue/40"
      [attr.aria-label]="label"
      [title]="label"
    >
      @if (themeStore.isDark()) {
        <span class="material-symbols-outlined text-[20px] text-amber-400">light_mode</span>
      } @else {
        <span class="material-symbols-outlined text-[20px] text-slate-700">dark_mode</span>
      }
    </button>
  `,
})
export class ThemeToggleComponent {
  protected readonly themeStore = inject(ThemeStore);
}
