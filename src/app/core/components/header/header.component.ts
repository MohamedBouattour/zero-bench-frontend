import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageStore } from '../../stores/language.store';
import { NavigationStore } from '../../stores/navigation.store';
import { LangSelectorComponent } from '../../widgets/lang-selector/lang-selector.component';
import { ThemeToggleComponent } from '../../widgets/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LangSelectorComponent, ThemeToggleComponent],
  template: `
    <header
      class="sticky top-0 z-40 h-16 border-b border-outline-variant/80 dark:border-slate-800/80 bg-surface-bright/80 dark:bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between transition-colors duration-200"
    >
      <!-- Left: Mobile Menu + Search Bar -->
      <div class="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        <!-- Mobile Drawer Toggle -->
        <button
          type="button"
          (click)="navStore.toggleMobileDrawer()"
          class="md:hidden p-2 rounded-lg text-outline dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-800 transition-colors"
          aria-label="Open Navigation"
        >
          <span class="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <!-- Search Input -->
        <div
          class="flex items-center w-full max-w-md bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-full px-3.5 py-1.5 focus-within:ring-2 focus-within:ring-secondary-blue/40 transition-shadow"
        >
          <span class="material-symbols-outlined text-outline dark:text-slate-500 text-[18px] mr-2">search</span>
          <input
            type="text"
            [placeholder]="t().searchPlaceholder"
            class="w-full bg-transparent border-none text-xs text-on-surface dark:text-slate-100 placeholder:text-outline dark:placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      <!-- Right: Actions, Widgets, and Profile -->
      <div class="flex items-center gap-1.5 sm:gap-2.5">
        <!-- Language Selector Widget -->
        <app-lang-selector></app-lang-selector>

        <!-- Theme Toggle Widget -->
        <app-theme-toggle></app-theme-toggle>

        <!-- Notification Bell -->
        <button
          type="button"
          class="p-2 text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-800 rounded-full transition-colors relative"
          aria-label="Notifications"
        >
          <span class="material-symbols-outlined text-[20px]">notifications</span>
          <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
        </button>

        <!-- User Profile Avatar -->
        <div class="flex items-center gap-2 pl-2 border-l border-outline-variant/60 dark:border-slate-800/60">
          <div
            class="w-8 h-8 rounded-full ring-1 ring-outline-variant dark:ring-slate-700 bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-xs"
          >
            JD
          </div>
          <div class="hidden lg:block text-left leading-tight">
            <span class="block text-xs font-semibold text-on-surface dark:text-white">Jean Dupont</span>
            <span class="block text-[10px] text-outline dark:text-slate-400">Resource Director</span>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  private readonly langStore = inject(LanguageStore);
  readonly navStore = inject(NavigationStore);

  readonly t = this.langStore.translations;
}
