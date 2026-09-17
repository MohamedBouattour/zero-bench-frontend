import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, signal } from '@angular/core';
import { LanguageStore } from '../../stores/language.store';
import { SupportedLanguage } from '../../models/language.model';

@Component({
  selector: 'app-lang-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'relative inline-block text-left',
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'isOpen.set(false)',
  },
  template: `
    <button
      type="button"
      (click)="isOpen.set(!isOpen())"
      class="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 text-on-surface dark:text-slate-200 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary-blue/40"
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
        class="absolute right-0 z-50 mt-1 w-32 origin-top-right rounded-lg bg-surface-container-lowest dark:bg-slate-900 py-1 shadow-lg ring-1 ring-black/5 dark:ring-white/10 border border-outline-variant dark:border-slate-800 focus:outline-none"
        role="menu"
      >
        @for (opt of languages(); track opt.code) {
          @let active = opt.code === currentLang();
          <button
            type="button"
            (click)="selectLanguage(opt.code)"
            class="w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors"
            [class]="active ? 'font-bold text-secondary-blue dark:text-blue-400' : 'text-on-surface dark:text-slate-200'"
            role="menuitemradio"
            [attr.aria-checked]="active"
          >
            <span class="flex items-center gap-2">
              <span>{{ opt.flag }}</span>
              <span>{{ opt.label }}</span>
            </span>
            @if (active) {
              <span class="material-symbols-outlined text-[14px]">check</span>
            }
          </button>
        }
      </div>
    }
  `,
})
export class LangSelectorComponent {
  private readonly langStore = inject(LanguageStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly isOpen = signal(false);
  protected readonly currentLang = this.langStore.currentLang;
  protected readonly languages = this.langStore.languages;
  protected readonly currentOption = computed(() =>
    this.languages().find((l) => l.code === this.currentLang()),
  );

  protected selectLanguage(lang: SupportedLanguage): void {
    this.langStore.setLanguage(lang);
    this.isOpen.set(false);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.host.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
    }
  }
}
