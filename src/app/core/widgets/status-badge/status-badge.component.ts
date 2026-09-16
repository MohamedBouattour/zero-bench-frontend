import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultantStatus } from '../../models/consultant.model';
import { LanguageStore } from '../../stores/language.store';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border transition-colors"
      [ngClass]="classes()"
    >
      @if (status() === 'on_bench') {
        <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
      } @else if (status() === 'on_mission') {
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
      } @else if (status() === 'ending_soon') {
        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
      } @else {
        <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
      }
      <span>{{ label() }}</span>
    </span>
  `,
})
export class StatusBadgeComponent {
  private readonly langStore = inject(LanguageStore);

  readonly status = input.required<ConsultantStatus>();
  readonly customLabel = input<string>();

  readonly label = computed(() => {
    if (this.customLabel()) return this.customLabel();
    const t = this.langStore.translations().statuses;
    switch (this.status()) {
      case 'on_bench':
        return t.onBench;
      case 'on_mission':
        return t.onMission;
      case 'ending_soon':
        return t.endingSoon;
      case 'prospect':
        return t.prospect;
    }
  });

  readonly classes = computed(() => {
    switch (this.status()) {
      case 'on_bench':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60';
      case 'on_mission':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60';
      case 'ending_soon':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60';
      case 'prospect':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60';
    }
  });
}
