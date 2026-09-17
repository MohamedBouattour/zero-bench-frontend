import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavSection } from '../../models/navigation.model';
import { LanguageStore } from '../../stores/language.store';
import { NavigationStore } from '../../stores/navigation.store';

export const NAV_SECTIONS: readonly NavSection[] = [
  {
    titleKey: 'coreIntelligence',
    items: [
      { id: 'dashboard', icon: 'dashboard', route: '/dashboard' },
      { id: 'skillsGap', icon: 'query_stats', route: '/skills-gap' },
      { id: 'placements', icon: 'view_kanban', route: '/placements', badgeKey: 'placements', badgeType: 'danger' },
      { id: 'pitchGenerator', icon: 'auto_awesome', route: '/pitch-generator' },
    ],
  },
  {
    titleKey: 'administration',
    items: [
      { id: 'consultants', icon: 'badge', route: '/consultants', badgeKey: 'consultantsOnBench', badgeType: 'warning' },
      { id: 'clients', icon: 'business_center', route: '/clients' },
      { id: 'designSystem', icon: 'palette', route: '/design-system' },
    ],
  },
];

const BADGE_CLASSES = {
  danger: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
} as const;

@Component({
  selector: 'app-sidebar-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    @for (section of sections; track section.titleKey; let first = $first) {
      <div [class]="first ? '' : 'pt-5'">
        <div class="px-3 pb-1.5">
          <span class="text-[10px] uppercase font-bold tracking-wider text-outline dark:text-slate-500">
            {{ t().nav[section.titleKey] }}
          </span>
        </div>
        <ul class="space-y-0.5">
          @for (item of section.items; track item.id) {
            <li>
              <a
                [routerLink]="item.route"
                routerLinkActive="bg-surface-container-low dark:bg-slate-800 text-secondary-blue! dark:text-blue-400! font-semibold"
                ariaCurrentWhenActive="page"
                (click)="navigate.emit()"
                class="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-low dark:hover:bg-slate-800 transition-colors group"
              >
                <span
                  class="material-symbols-outlined text-[18px] text-outline dark:text-slate-400 group-hover:text-secondary-blue dark:group-hover:text-blue-400 transition-colors"
                  aria-hidden="true"
                >
                  {{ item.icon }}
                </span>
                <span class="flex-1">{{ t().nav[item.id] }}</span>
                @if (item.badgeKey && navStore.badges()[item.badgeKey] > 0) {
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-bold" [class]="badgeClasses[item.badgeType ?? 'info']">
                    {{ navStore.badges()[item.badgeKey] }}
                  </span>
                }
              </a>
            </li>
          }
        </ul>
      </div>
    }
  `,
})
export class SidebarNavComponent {
  /** Emitted when a link is followed (the mobile drawer closes itself). */
  readonly navigate = output<void>();

  protected readonly t = inject(LanguageStore).translations;
  protected readonly navStore = inject(NavigationStore);
  protected readonly sections = NAV_SECTIONS;
  protected readonly badgeClasses = BADGE_CLASSES;
}
