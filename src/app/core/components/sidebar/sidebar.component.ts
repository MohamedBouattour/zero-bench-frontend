import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageStore } from '../../stores/language.store';
import { NavigationStore } from '../../stores/navigation.store';
import { LogoComponent } from '../logo/logo.component';
import { SidebarNavComponent } from './sidebar-nav.component';

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LogoComponent, SidebarNavComponent],
  host: {
    '(document:keydown.escape)': 'navStore.closeMobileDrawer()',
  },
  template: `
    <!-- Desktop Sidebar -->
    <aside
      class="hidden md:flex flex-col w-60 h-screen fixed left-0 top-0 border-r border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 z-50 transition-colors duration-200"
    >
      <!-- Brand Header -->
      <div class="px-5 pt-6 pb-5 border-b border-outline-variant/60 dark:border-slate-800/60">
        <app-logo size="md" [subtitle]="t().appSubtitle" />
      </div>

      <!-- Navigation Sections -->
      <nav class="flex-1 px-3 py-4 overflow-y-auto" aria-label="Main navigation">
        <app-sidebar-nav />
      </nav>

      <!-- Quick Action CTA: opens the consultant intake modal -->
      <div class="p-4 border-t border-outline-variant/60 dark:border-slate-800/60 mt-auto">
        <a
          routerLink="/consultants"
          [queryParams]="{ mode: 'new' }"
          class="w-full bg-secondary-blue dark:bg-blue-600 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex justify-center items-center gap-2 hover:opacity-95 shadow-sm shadow-secondary-blue/30 active:scale-[0.98] transition-all"
        >
          <span class="material-symbols-outlined text-[16px]">add</span>
          <span>{{ t().addConsultant }}</span>
        </a>
      </div>
    </aside>

    <!-- Mobile Drawer -->
    @if (navStore.isMobileDrawerOpen()) {
      <div class="fixed inset-0 z-50 md:hidden flex">
        <!-- Backdrop -->
        <div
          (click)="navStore.closeMobileDrawer()"
          class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        ></div>

        <!-- Drawer Content -->
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          class="relative w-64 max-w-[80vw] h-full bg-surface-container-lowest dark:bg-slate-900 border-r border-outline-variant dark:border-slate-800 flex flex-col z-50 p-4 shadow-xl"
        >
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant dark:border-slate-800">
            <app-logo size="sm" [subtitle]="t().appSubtitle" />
            <button
              type="button"
              (click)="navStore.closeMobileDrawer()"
              class="p-1 rounded-md text-outline hover:text-on-surface dark:hover:text-white"
              [attr.aria-label]="t().actions.close"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <nav class="flex-1 py-4 overflow-y-auto" aria-label="Main navigation">
            <app-sidebar-nav (navigate)="navStore.closeMobileDrawer()" />
          </nav>

          <a
            routerLink="/consultants"
            [queryParams]="{ mode: 'new' }"
            (click)="navStore.closeMobileDrawer()"
            class="w-full bg-secondary-blue dark:bg-blue-600 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex justify-center items-center gap-2"
          >
            <span class="material-symbols-outlined text-[16px]">add</span>
            <span>{{ t().addConsultant }}</span>
          </a>
        </div>
      </div>
    }
  `,
})
export class SidebarComponent {
  protected readonly navStore = inject(NavigationStore);
  protected readonly t = inject(LanguageStore).translations;

  constructor() {
    void this.navStore.loadBadges();
  }
}
