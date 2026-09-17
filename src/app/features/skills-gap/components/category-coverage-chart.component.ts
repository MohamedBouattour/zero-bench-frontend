import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CategoryCoverage } from '../models/skills-gap.model';

/** Horizontal paired bars: available supply (blue) vs open demand (orange) per skill category. */
@Component({
  selector: 'app-category-coverage-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="h-full p-5 rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 shadow-sm">
      <figcaption class="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 class="text-sm font-bold text-on-surface dark:text-white">Coverage by category</h3>
          <p class="text-xs text-outline dark:text-slate-400 mt-0.5">Available consultant skills vs open RFP requirements</p>
        </div>
        <ul class="flex items-center gap-3 text-[11px] text-on-surface-variant dark:text-slate-300" aria-label="Legend">
          <li class="flex items-center gap-1.5"><span class="w-3 h-2 rounded-sm bg-[#2a78d6] dark:bg-[#3987e5]"></span>Supply</li>
          <li class="flex items-center gap-1.5"><span class="w-3 h-2 rounded-sm bg-[#eb6834] dark:bg-[#d95926]"></span>Demand</li>
        </ul>
      </figcaption>

      <ul class="space-y-3">
        @for (row of rows(); track row.category) {
          <li>
            <button
              type="button"
              (click)="selectCategory.emit(row.category)"
              class="viz-tip w-full grid grid-cols-[6.5rem_1fr] items-center gap-3 text-left rounded-md p-1 -m-1 hover:bg-surface-container-low/60 dark:hover:bg-slate-800/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-blue/40"
              [attr.data-tip]="row.category + '\\nSupply: ' + row.supply + ' · Demand: ' + row.demand + '\\n' + row.verdict"
              [attr.aria-label]="row.category + ': supply ' + row.supply + ', demand ' + row.demand + '. ' + row.verdict"
            >
              <span class="text-xs font-semibold text-on-surface dark:text-slate-200 truncate">{{ row.category }}</span>
              <span class="flex flex-col gap-0.5">
                <span class="flex items-center gap-2">
                  <span class="h-2.5 rounded-r bg-[#2a78d6] dark:bg-[#3987e5] transition-all" [style.width.%]="row.supplyPct"></span>
                  <span class="text-[10px] font-semibold text-on-surface-variant dark:text-slate-300 tabular-nums">{{ row.supply }}</span>
                </span>
                <span class="flex items-center gap-2">
                  <span class="h-2.5 rounded-r bg-[#eb6834] dark:bg-[#d95926] transition-all" [style.width.%]="row.demandPct"></span>
                  <span class="text-[10px] font-semibold text-on-surface-variant dark:text-slate-300 tabular-nums">{{ row.demand }}</span>
                </span>
              </span>
            </button>
          </li>
        } @empty {
          <li class="text-xs text-outline dark:text-slate-400 py-6 text-center">No category data.</li>
        }
      </ul>
    </figure>
  `,
})
export class CategoryCoverageChartComponent {
  readonly data = input.required<readonly CategoryCoverage[]>();
  readonly selectCategory = output<string>();

  protected readonly rows = computed(() => {
    const rows = this.data();
    const max = Math.max(1, ...rows.flatMap((r) => [r.supply, r.demand]));
    // Bars leave room for their direct label; a zero value keeps a hairline so the baseline stays visible.
    const pct = (value: number) => (value === 0 ? 0.5 : (value / max) * 85);
    return rows.map((r) => ({
      ...r,
      supplyPct: pct(r.supply),
      demandPct: pct(r.demand),
      verdict:
        r.demand > r.supply ? `Shortage of ${r.demand - r.supply}` : r.supply > r.demand ? `Surplus of ${r.supply - r.demand}` : 'Balanced',
    }));
  });
}
