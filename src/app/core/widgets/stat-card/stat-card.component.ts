import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type StatCardTone = 'primary' | 'danger' | 'warning' | 'success' | 'indigo';
export type TrendDirection = 'up-good' | 'up-bad' | 'down-good' | 'down-bad';

const TONE_STYLES: Record<StatCardTone, { accent: string; icon: string }> = {
  primary: { accent: 'bg-blue-500', icon: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400' },
  danger: { accent: 'bg-red-500', icon: 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400' },
  warning: { accent: 'bg-amber-500', icon: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400' },
  success: {
    accent: 'bg-emerald-500',
    icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
  },
  indigo: { accent: 'bg-indigo-500', icon: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400' },
};

@Component({
  selector: 'app-stat-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="h-full bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group hover:shadow-md dark:hover:border-slate-700 transition-all duration-300"
    >
      <div
        class="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-125 transition-transform duration-500"
        [class]="toneStyle().accent"
      ></div>

      <div class="flex items-center justify-between z-10">
        <span class="text-xs font-semibold uppercase tracking-wider text-outline dark:text-slate-400">
          {{ label() }}
        </span>
        <div class="w-8 h-8 rounded-lg flex items-center justify-center" [class]="toneStyle().icon">
          <span class="material-symbols-outlined text-[18px]">{{ icon() }}</span>
        </div>
      </div>

      <div class="mt-3 z-10">
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-bold tracking-tight text-on-surface dark:text-white">
            {{ value() }}
          </span>
          @if (unit()) {
            <span class="text-xs font-medium text-outline dark:text-slate-400">{{ unit() }}</span>
          }
        </div>

        @if (subtext() || trend()) {
          <div class="flex flex-wrap items-center gap-1.5 mt-1 text-xs">
            @if (trend()) {
              <span
                class="font-semibold flex items-center gap-0.5"
                [class]="isPositiveTrend() ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'"
              >
                <span class="material-symbols-outlined text-[14px]">{{ trendIcon() }}</span>
                {{ trend() }}
              </span>
            }
            @if (subtext()) {
              <span class="text-outline dark:text-slate-400">{{ subtext() }}</span>
            }
          </div>
        }
      </div>

      @if (progress() !== undefined) {
        <div
          class="w-full bg-surface-container-low dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3 z-10"
          role="progressbar"
          [attr.aria-valuenow]="progress()"
          aria-valuemin="0"
          aria-valuemax="100"
          [attr.aria-label]="label()"
        >
          <div
            class="h-full rounded-full transition-all duration-500"
            [style.width.%]="progress()"
            [class]="toneStyle().accent"
          ></div>
        </div>
      }
    </div>
  `,
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly unit = input<string>();
  readonly icon = input.required<string>();
  readonly trend = input<string>();
  readonly trendDirection = input<TrendDirection>('up-good');
  readonly subtext = input<string>();
  readonly progress = input<number>();
  readonly tone = input<StatCardTone>('primary');

  protected readonly toneStyle = computed(() => TONE_STYLES[this.tone()]);
  protected readonly isPositiveTrend = computed(() => this.trendDirection().endsWith('good'));
  protected readonly trendIcon = computed(() =>
    this.trendDirection().startsWith('up') ? 'trending_up' : 'trending_down',
  );
}
