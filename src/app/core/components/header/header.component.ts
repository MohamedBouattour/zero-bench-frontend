import { ChangeDetectionStrategy, Component, ElementRef, inject, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageStore } from '../../stores/language.store';
import { NavigationStore } from '../../stores/navigation.store';
import { SessionStore } from '../../stores/session.store';
import { AvatarComponent } from '../../widgets/avatar/avatar.component';
import { LangSelectorComponent } from '../../widgets/lang-selector/lang-selector.component';
import { NotificationsMenuComponent } from '../../widgets/notifications-menu/notifications-menu.component';
import { ThemeToggleComponent } from '../../widgets/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AvatarComponent, LangSelectorComponent, NotificationsMenuComponent, ThemeToggleComponent],
  host: {
    '(document:keydown)': 'onGlobalKeydown($event)',
  },
  template: `
    <header
      class="sticky top-0 z-40 h-16 border-b border-outline-variant/80 dark:border-slate-800/80 bg-surface-bright/80 dark:bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3 transition-colors duration-200"
    >
      <!-- Left: Mobile Menu + Search Bar -->
      <div class="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        <!-- Mobile Drawer Toggle -->
        <button
          type="button"
          (click)="navStore.toggleMobileDrawer()"
          class="md:hidden p-2 rounded-lg text-outline dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-800 transition-colors"
          aria-label="Open Navigation"
          [attr.aria-expanded]="navStore.isMobileDrawerOpen()"
        >
          <span class="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <!-- Global Search: routes to the consultants directory -->
        <form
          role="search"
          (submit)="search($event)"
          class="flex items-center w-full max-w-md bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-full px-3.5 py-1.5 focus-within:ring-2 focus-within:ring-secondary-blue/40 transition-shadow"
        >
          <span class="material-symbols-outlined text-outline dark:text-slate-500 text-[18px] mr-2" aria-hidden="true">search</span>
          <input
            #searchInput
            type="search"
            name="q"
            [placeholder]="t().searchPlaceholder"
            [attr.aria-label]="t().actions.search"
            [title]="t().header.searchShortcut"
            class="w-full bg-transparent border-none text-xs text-on-surface dark:text-slate-100 placeholder:text-outline dark:placeholder:text-slate-500 focus:outline-none"
          />
          <kbd
            class="hidden sm:inline-flex items-center whitespace-nowrap px-1.5 py-0.5 ml-2 rounded border border-outline-variant dark:border-slate-700 text-[10px] font-sans font-semibold text-outline dark:text-slate-500"
          >
            Ctrl K
          </kbd>
        </form>
      </div>

      <!-- Right: Actions, Widgets, and Profile -->
      <div class="flex items-center gap-1.5 sm:gap-2.5">
        <app-lang-selector />
        <app-theme-toggle />
        <app-notifications-menu />

        <!-- User Profile -->
        <div class="flex items-center gap-2 pl-2 border-l border-outline-variant/60 dark:border-slate-800/60">
          @if (session.user(); as user) {
            <app-avatar [name]="user.fullName" size="sm" />
            <div class="hidden lg:block text-left leading-tight">
              <span class="block text-xs font-semibold text-on-surface dark:text-white">{{ user.fullName }}</span>
              <span class="block text-[10px] text-outline dark:text-slate-400">{{ user.role }}</span>
            </div>
          } @else {
            <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" aria-hidden="true"></div>
          }
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  protected readonly navStore = inject(NavigationStore);
  protected readonly session = inject(SessionStore);
  protected readonly t = inject(LanguageStore).translations;

  private readonly router = inject(Router);
  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  constructor() {
    void this.session.load();
  }

  protected search(event: Event): void {
    event.preventDefault();
    const input = this.searchInput().nativeElement;
    const q = input.value.trim();
    void this.router.navigate(['/consultants'], { queryParams: { q: q || null } });
    input.blur();
  }

  protected onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.searchInput().nativeElement.focus();
    }
  }
}
