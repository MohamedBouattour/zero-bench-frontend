import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ClientStatus } from '../models/customer.model';

const STYLES: Record<ClientStatus, { label: string; classes: string }> = {
  active: { label: 'Active', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60' },
  prospect: { label: 'Prospect', classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60' },
  paused: { label: 'Paused', classes: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' },
};

@Component({
  selector: 'app-client-status-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap" [class]="style().classes">
      {{ style().label }}
    </span>
  `,
})
export class ClientStatusChipComponent {
  readonly status = input.required<ClientStatus>();
  protected readonly style = computed(() => STYLES[this.status()]);
}
