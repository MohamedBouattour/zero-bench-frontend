import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { SkillDemandLevel, SkillDemandTrend } from '../models/skills-gap.model';

const LEVELS: Record<SkillDemandLevel, { label: string; classes: string }> = {
  high: { label: 'High demand', classes: 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-900/60' },
  medium: { label: 'Medium demand', classes: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60' },
  low: { label: 'Low demand', classes: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
  declining: { label: 'Declining', classes: 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
};

const TREND_ICONS: Record<SkillDemandTrend, string> = {
  rising: 'trending_up',
  stable: 'trending_flat',
  declining: 'trending_down',
};

/** Demand level chip; the trend is carried by icon + label, never by colour alone. */
@Component({
  selector: 'app-demand-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold whitespace-nowrap"
      [class]="style().classes"
      [attr.title]="'Trend: ' + trend()"
    >
      <span class="material-symbols-outlined text-[14px]" aria-hidden="true">{{ trendIcon() }}</span>
      {{ style().label }}
    </span>
  `,
})
export class DemandBadgeComponent {
  readonly level = input.required<SkillDemandLevel>();
  readonly trend = input.required<SkillDemandTrend>();

  protected readonly style = computed(() => LEVELS[this.level()]);
  protected readonly trendIcon = computed(() => TREND_ICONS[this.trend()]);
}
