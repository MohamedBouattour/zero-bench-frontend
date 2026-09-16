import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LanguageStore } from '../../stores/language.store';
import { NavigationStore } from '../../stores/navigation.store';
import { NavSection } from '../../models/navigation.model';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LogoComponent],
  template: `
    <!-- Desktop Sidebar -->
    <aside
      class="hidden md:flex flex-col w-60 h-screen fixed left-0 top-0 border-r border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 z-50 transition-colors duration-200"
    >
      <!-- Brand Header -->
      <div class="px-5 pt-6 pb-5 border-b border-outline-variant/60 dark:border-slate-800/60">
        <app-logo size="md" [subtitle]="t().appSubtitle"></app-logo>
      </div>

      <!-- Navigation Sections -->
      <div class="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        <!-- Core Intelligence -->
        <div>
          <div class="px-3 pb-1.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-outline dark:text-slate-500">
              {{ t().nav.coreIntelligence }}
            </span>
          </div>
          <div class="space-y-0.5">
            @for (item of intelligenceNav; track item.id) {
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-surface-container-low dark:bg-slate-800 text-secondary-blue dark:text-blue-400 font-semibold border-r-2 border-secondary-blue dark:border-blue-400"
                [routerLinkActiveOptions]="{ exact: item.route === '/' || item.route === '/dashboard' }"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors group"
              >
                <span
                  class="material-symbols-outlined text-[18px] text-outline dark:text-slate-400 group-hover:text-secondary-blue dark:group-hover:text-blue-400 transition-colors"
                >
                  {{ item.icon }}
                </span>
                <span class="flex-1">{{ getTranslatedLabel(item.id) }}</span>
                @if (item.badge) {
                  <span
                    class="px-1.5 py-0.5 rounded text-[10px] font-bold"
                    [class.bg-red-100]="item.badgeType === 'danger'"
                    [class.text-red-700]="item.badgeType === 'danger'"
                    [class.dark:bg-red-950/60]="item.badgeType === 'danger'"
                    [class.dark:text-red-400]="item.badgeType === 'danger'"
                  >
                    {{ item.badge }}
                  </span>
                }
              </a>
            }
          </div>
        </div>

        <!-- Administration -->
        <div>
          <div class="px-3 pb-1.5">
            <span class="text-[10px] uppercase font-bold tracking-wider text-outline dark:text-slate-500">
              {{ t().nav.administration }}
            </span>
          </div>
          <div class="space-y-0.5">
            @for (item of adminNav; track item.id) {
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-surface-container-low dark:bg-slate-800 text-secondary-blue dark:text-blue-400 font-semibold border-r-2 border-secondary-blue dark:border-blue-400"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors group"
              >
                <span
                  class="material-symbols-outlined text-[18px] text-outline dark:text-slate-400 group-hover:text-secondary-blue dark:group-hover:text-blue-400 transition-colors"
                >
                  {{ item.icon }}
                </span>
                <span class="flex-1">{{ getTranslatedLabel(item.id) }}</span>
              </a>
            }
          </div>
        </div>
      </div>

      <!-- Quick Action CTA -->
      <div class="p-4 border-t border-outline-variant/60 dark:border-slate-800/60 mt-auto">
        <button
          type="button"
          (click)="onAddConsultant()"
          class="w-full bg-secondary-blue dark:bg-blue-600 text-white text-xs font-semibold py-2.5 px-4 rounded-xl flex justify-center items-center gap-2 hover:opacity-95 shadow-sm shadow-secondary-blue/30 active:scale-[0.98] transition-all"
        >
          <span class="material-symbols-outlined text-[16px]">add</span>
          <span>{{ t().addConsultant }}</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Drawer -->
    @if (navStore.isMobileDrawerOpen()) {
      <div class="fixed inset-0 z-50 md:hidden flex">
        <!-- Backdrop -->
        <div
          (click)="navStore.closeMobileDrawer()"
          class="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        ></div>

        <!-- Drawer Content -->
        <div
          class="relative w-64 max-w-[80vw] h-full bg-surface-container-lowest dark:bg-slate-900 border-r border-outline-variant dark:border-slate-800 flex flex-col z-50 p-4 shadow-xl"
        >
          <div class="flex items-center justify-between pb-4 border-b border-outline-variant dark:border-slate-800">
            <app-logo size="sm" [subtitle]="t().appSubtitle"></app-logo>
            <button
              type="button"
              (click)="navStore.closeMobileDrawer()"
              class="p-1 rounded-md text-outline hover:text-on-surface dark:hover:text-white"
            >
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div class="flex-1 py-4 overflow-y-auto space-y-4">
            <div class="space-y-1">
              @for (item of intelligenceNav; track item.id) {
                <a
                  [routerLink]="item.route"
                  (click)="navStore.closeMobileDrawer()"
                  routerLinkActive="bg-surface-container-low dark:bg-slate-800 text-secondary-blue dark:text-blue-400 font-semibold"
                  class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-on-surface-variant dark:text-slate-300"
                >
                  <span class="material-symbols-outlined text-[18px]">{{ item.icon }}</span>
                  <span>{{ getTranslatedLabel(item.id) }}</span>
                </a>
              }
            </div>

            <div class="pt-2 border-t border-outline-variant dark:border-slate-800 space-y-1">
              @for (item of adminNav; track item.id) {
                <a
                  [routerLink]="item.route"
                  (click)="navStore.closeMobileDrawer()"
                  routerLinkActive="bg-surface-container-low dark:bg-slate-800 text-secondary-blue dark:text-blue-400 font-semibold"
                  class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-on-surface-variant dark:text-slate-300"
                >
                  <span class="material-symbols-outlined text-[18px]">{{ item.icon }}</span>
                  <span>{{ getTranslatedLabel(item.id) }}</span>
                </a>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class SidebarComponent {
  private readonly langStore = inject(LanguageStore);
  readonly navStore = inject(NavigationStore);

  readonly t = this.langStore.translations;

  readonly intelligenceNav = [
    { id: 'dashboard', icon: 'dashboard', route: '/dashboard' },
    { id: 'skillsGap', icon: 'query_stats', route: '/skills-gap' },
    { id: 'placements', icon: 'view_kanban', route: '/placements', badge: '3', badgeType: 'danger' as const },
    { id: 'pitchGenerator', icon: 'auto_awesome', route: '/pitch-generator' },
  ];

  readonly adminNav = [
    { id: 'consultants', icon: 'badge', route: '/consultants' },
    { id: 'clients', icon: 'business_center', route: '/clients' },
    { id: 'designSystem', icon: 'palette', route: '/design-system' },
  ];

  getTranslatedLabel(id: string): string {
    const nav = this.t().nav as Record<string, string>;
    return nav[id] ?? id;
  }

  onAddConsultant(): void {
    // Quick action handler
    alert('Modal / Drawer: Add Consultant action triggered.');
  }
}
