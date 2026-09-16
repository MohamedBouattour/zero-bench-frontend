import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai-sparkle-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="relative overflow-hidden rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 bg-gradient-to-br from-indigo-50/50 via-white/80 to-blue-50/40 dark:from-indigo-950/20 dark:via-slate-900/80 dark:to-slate-900/40 backdrop-blur-md p-5 shadow-sm"
    >
      <div class="flex items-start justify-between gap-4">
        <div class="flex items-start gap-3">
          <div
            class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/30"
          >
            <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                AI Match & Optimization
              </span>
              @if (matchScore()) {
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                  {{ matchScore() }}% Match
                </span>
              }
            </div>
            <h4 class="text-sm font-semibold text-on-surface dark:text-white mt-1">
              {{ title() }}
            </h4>
            <p class="text-xs text-on-surface-variant dark:text-slate-300 mt-1 leading-relaxed">
              {{ description() }}
            </p>
          </div>
        </div>

        @if (actionLabel()) {
          <button
            type="button"
            (click)="actionClicked.emit()"
            class="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          >
            <span>{{ actionLabel() }}</span>
            <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        }
      </div>
    </div>
  `,
})
export class AiSparkleCardComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly matchScore = input<number>();
  readonly actionLabel = input<string>();

  readonly actionClicked = output<void>();
}
