import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastType } from '../../models/toast.model';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 pointer-events-auto bg-white/95 dark:bg-slate-900/95"
      [ngClass]="containerClasses()"
      role="alert"
      [attr.aria-live]="toast().type === 'error' ? 'assertive' : 'polite'"
    >
      <!-- Toast Icon -->
      <div class="flex-shrink-0 p-1.5 rounded-lg" [ngClass]="iconContainerClasses()">
        <span class="material-symbols-outlined text-[18px] block">{{ iconName() }}</span>
      </div>

      <!-- Toast Content -->
      <div class="flex-1 min-w-0 pt-0.5">
        @if (toast().title) {
          <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-0.5">
            {{ toast().title }}
          </h4>
        }
        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">
          {{ toast().message }}
        </p>
      </div>

      <!-- Dismiss Button -->
      <button
        type="button"
        (click)="dismiss.emit(toast().id)"
        class="flex-shrink-0 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
        aria-label="Dismiss notification"
      >
        <span class="material-symbols-outlined text-[16px] block">close</span>
      </button>
    </div>
  `,
})
export class ToastComponent {
  readonly toast = input.required<Toast>();
  readonly dismiss = output<string>();

  readonly containerClasses = computed(() => {
    switch (this.toast().type) {
      case 'success':
        return 'border-emerald-500/30 dark:border-emerald-500/30';
      case 'error':
        return 'border-red-500/30 dark:border-red-500/30';
      case 'warning':
        return 'border-amber-500/30 dark:border-amber-500/30';
      case 'info':
      default:
        return 'border-blue-500/30 dark:border-blue-500/30';
    }
  });

  readonly iconContainerClasses = computed(() => {
    switch (this.toast().type) {
      case 'success':
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400';
      case 'error':
        return 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400';
      case 'warning':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400';
      case 'info':
      default:
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400';
    }
  });

  readonly iconName = computed(() => {
    switch (this.toast().type) {
      case 'success':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  });
}
