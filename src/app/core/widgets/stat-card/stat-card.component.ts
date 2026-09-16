import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden group hover:shadow-md dark:hover:border-slate-700 transition-all duration-300"
    >
      <div
        class="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-125 transition-transform duration-500"
        [ngClass]="circleBgClass()"
      ></div>

      <div class="flex items-center justify-between z-10">
        <span class="text-xs font-semibold uppercase tracking-wider text-outline dark:text-slate-400">
          {{ label() }}
        </span>
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center"
          [ngClass]="iconContainerClass()"
        >
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
          <div class="flex items-center gap-1.5 mt-1 text-xs">
            @if (trend()) {
              <span
                class="font-semibold flex items-center gap-0.5"
                [class.text-emerald-600]="trendDirection() === 'up-good' || trendDirection() === 'down-good'"
                [class.text-red-600]="trendDirection() === 'up-bad' || trendDirection() === 'down-bad'"
              >
                <span class="material-symbols-outlined text-[14px]">
                  {{ trendDirection().startsWith('up') ? 'trending_up' : 'trending_down' }}
                </span>
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
        <div class="w-full bg-surface-container-low dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3 z-10">
          <div
            class="h-full rounded-full transition-all duration-500"
            [style.width.%]="progress()"
            [ngClass]="progressBarClass()"
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
  readonly trendDirection = input<'up-good' | 'up-bad' | 'down-good' | 'down-bad'>('up-good');
  readonly subtext = input<string>();
  readonly progress = input<number>();
  readonly tone = input<'primary' | 'danger' | 'warning' | 'success' | 'indigo'>('primary');

  circleBgClass(): string {
    switch (this.tone()) {
      case 'danger':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'success':
        return 'bg-emerald-500';
      case 'indigo':
        return 'bg-indigo-500';
      default:
        return 'bg-blue-500';
    }
  }

  iconContainerClass(): string {
    switch (this.tone()) {
      case 'danger':
        return 'bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400';
      case 'warning':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400';
      case 'success':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400';
      default:
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400';
    }
  }

  progressBarClass(): string {
    switch (this.tone()) {
      case 'danger':
        return 'bg-red-500';
      case 'warning':
        return 'bg-amber-500';
      case 'success':
        return 'bg-emerald-500';
      case 'indigo':
        return 'bg-indigo-500';
      default:
        return 'bg-blue-500';
    }
  }
}
