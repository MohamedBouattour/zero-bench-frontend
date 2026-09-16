import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageStore } from '../../stores/language.store';
import { SupportedLanguage } from '../../models/language.model';

@Component({
  selector: 'app-lang-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left">
      <button
        type="button"
        (click)="toggleDropdown()"
        class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-outline-variant bg-surface-container-lowest dark:bg-slate-900 text-on-surface dark:text-slate-200 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-blue/40"
        aria-haspopup="true"
        [attr.aria-expanded]="isOpen()"
        aria-label="Select Language"
      >
        <span>{{ currentOption()?.flag }}</span>
        <span class="uppercase tracking-wider font-bold">{{ currentLang() }}</span>
        <span class="material-symbols-outlined text-[16px] text-outline">expand_more</span>
      </button>

      @if (isOpen()) {
        <div
          class="absolute right-0 z-50 mt-1 w-32 origin-top-right rounded-lg bg-surface-container-lowest dark:bg-slate-900 py-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10 border border-outline-variant focus:outline-none animate-in fade-in zoom-in-95 duration-100"
          role="menu"
        >
          @for (opt of languages(); track opt.code) {
            <button
              type="button"
              (click)="selectLanguage(opt.code)"
              class="w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors"
              [class.font-bold]="opt.code === currentLang()"
              [class.text-secondary-blue]="opt.code === currentLang()"
              [class.dark:text-blue-400]="opt.code === currentLang()"
              role="menuitem"
            >
              <span class="flex items-center gap-2">
                <span>{{ opt.flag }}</span>
                <span>{{ opt.label }}</span>
              </span>
              @if (opt.code === currentLang()) {
                <span class="material-symbols-outlined text-[14px]">check</span>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class LangSelectorComponent {
  private readonly langStore = inject(LanguageStore);

  readonly isOpen = signal(false);
  readonly currentLang = this.langStore.currentLang;
  readonly languages = this.langStore.languages;

  currentOption() {
    return this.languages().find((l) => l.code === this.currentLang());
  }

  toggleDropdown(): void {
    this.isOpen.update((open) => !open);
  }

  selectLanguage(lang: SupportedLanguage): void {
    this.langStore.setLanguage(lang);
    this.isOpen.set(false);
  }
}
