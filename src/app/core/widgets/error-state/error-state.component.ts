import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      role="alert"
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30"
    >
      <div class="flex items-start gap-3">
        <span class="material-symbols-outlined text-[20px] text-red-600 dark:text-red-400">cloud_off</span>
        <div>
          <p class="text-xs font-bold text-red-700 dark:text-red-300">{{ title() }}</p>
          <p class="text-xs text-red-600 dark:text-red-400 mt-0.5">{{ message() }}</p>
        </div>
      </div>
      <button
        type="button"
        (click)="retry.emit()"
        class="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-950/60 transition-colors"
      >
        <span class="material-symbols-outlined text-[16px]">refresh</span>
        <span>Retry</span>
      </button>
    </div>
  `,
})
export class ErrorStateComponent {
  readonly title = input<string>('Something went wrong');
  readonly message = input.required<string>();
  readonly retry = output<void>();
}
