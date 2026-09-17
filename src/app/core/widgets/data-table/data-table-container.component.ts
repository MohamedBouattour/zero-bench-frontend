import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { LanguageStore } from '../../stores/language.store';

export type TableDensity = 'compact' | 'comfortable';

const DENSITY_BUTTON_BASE = 'px-2.5 py-1 rounded-md font-medium transition-all';
const DENSITY_BUTTON_ACTIVE =
  'bg-surface-container-lowest dark:bg-slate-700 shadow-xs text-on-surface dark:text-white';
const DENSITY_BUTTON_IDLE = 'text-outline dark:text-slate-400 hover:text-on-surface dark:hover:text-white';

@Component({
  selector: 'app-data-table-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl overflow-hidden shadow-sm"
    >
      <!-- Header / Toolbar -->
      <div
        class="px-5 py-3.5 border-b border-outline-variant dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-bright/40 dark:bg-slate-900/60"
      >
        <div>
          <h3 class="text-sm font-bold text-on-surface dark:text-white">
            {{ title() }}
          </h3>
          @if (subtitle()) {
            <p class="text-xs text-outline dark:text-slate-400 mt-0.5">
              {{ subtitle() }}
            </p>
          }
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Density Toggle -->
          <div
            class="flex items-center p-0.5 bg-surface-container-low dark:bg-slate-800 rounded-lg border border-outline-variant dark:border-slate-700 text-xs"
            role="group"
            aria-label="Table density"
          >
            <button
              type="button"
              (click)="density.set('compact')"
              [class]="compactButtonClass()"
              [attr.aria-pressed]="density() === 'compact'"
            >
              {{ t().actions.compactView }}
            </button>
            <button
              type="button"
              (click)="density.set('comfortable')"
              [class]="comfortableButtonClass()"
              [attr.aria-pressed]="density() === 'comfortable'"
            >
              {{ t().actions.comfortableView }}
            </button>
          </div>

          <ng-content select="[actions]" />
        </div>
      </div>

      <!-- Table Body Slot: compact density tightens every projected cell -->
      <div class="overflow-x-auto" [class]="bodyClass()">
        <ng-content />
      </div>

      <!-- Footer / Pagination Slot -->
      <div
        class="empty:hidden px-5 py-3 border-t border-outline-variant dark:border-slate-800 flex items-center justify-between text-xs text-outline dark:text-slate-400 bg-surface-bright/20 dark:bg-slate-900/40"
      ><ng-content select="[footer]" /></div>
    </div>
  `,
})
export class DataTableContainerComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly density = model<TableDensity>('compact');

  protected readonly t = inject(LanguageStore).translations;

  protected readonly bodyClass = computed(() =>
    this.density() === 'compact' ? '[&_td]:py-1.5 [&_th]:py-1.5' : '',
  );

  protected readonly compactButtonClass = computed(
    () => `${DENSITY_BUTTON_BASE} ${this.density() === 'compact' ? DENSITY_BUTTON_ACTIVE : DENSITY_BUTTON_IDLE}`,
  );
  protected readonly comfortableButtonClass = computed(
    () => `${DENSITY_BUTTON_BASE} ${this.density() === 'comfortable' ? DENSITY_BUTTON_ACTIVE : DENSITY_BUTTON_IDLE}`,
  );
}
