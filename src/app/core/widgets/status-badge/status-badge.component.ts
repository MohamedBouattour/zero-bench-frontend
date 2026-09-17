import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ConsultantStatus } from '../../models/consultant.model';
import { LanguageStore } from '../../stores/language.store';

const STATUS_STYLES: Record<ConsultantStatus, { chip: string; dot: string }> = {
  on_bench: {
    chip: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/60',
    dot: 'bg-red-500 animate-pulse',
  },
  on_mission: {
    chip: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60',
    dot: 'bg-emerald-500',
  },
  ending_soon: {
    chip: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60',
    dot: 'bg-amber-500',
  },
  prospect: {
    chip: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60',
    dot: 'bg-blue-500',
  },
};

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border whitespace-nowrap transition-colors"
      [class]="style().chip"
    >
      <span class="w-1.5 h-1.5 rounded-full" [class]="style().dot"></span>
      <span>{{ label() }}</span>
    </span>
  `,
})
export class StatusBadgeComponent {
  private readonly langStore = inject(LanguageStore);

  readonly status = input.required<ConsultantStatus>();
  readonly customLabel = input<string>();

  protected readonly style = computed(() => STATUS_STYLES[this.status()]);

  protected readonly label = computed(() => {
    const custom = this.customLabel();
    if (custom) return custom;
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
}
