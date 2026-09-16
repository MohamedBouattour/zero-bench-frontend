import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-table-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="bg-surface-container-lowest dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl overflow-hidden shadow-sm"
    >
      <!-- Header / Toolbar -->
      <div
        class="px-5 py-3.5 border-b border-outline-variant dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-bright/40 dark:bg-slate-900/60"
      >
        <div>
          <h3 class="text-sm font-bold text-on-surface dark:text-white">
            {{ title() }}
          </h3>
          @if (subtitle()) {
            <p class="text-xs text-outline dark:text-slate-400 mt-0.5">
              {{ subtitle() }}
            </p>
          }
        </div>

        <div class="flex items-center gap-2.5">
          <!-- Density Toggle -->
          <div
            class="flex items-center p-0.5 bg-surface-container-low dark:bg-slate-800 rounded-lg border border-outline-variant dark:border-slate-700 text-xs"
          >
            <button
              type="button"
              (click)="setDensity('compact')"
              class="px-2.5 py-1 rounded-md font-medium transition-all"
              [class.bg-surface-container-lowest]="density() === 'compact'"
              [class.dark:bg-slate-700]="density() === 'compact'"
              [class.shadow-xs]="density() === 'compact'"
              [class.text-on-surface]="density() === 'compact'"
              [class.dark:text-white]="density() === 'compact'"
              [class.text-outline]="density() !== 'compact'"
            >
              Compact
            </button>
            <button
              type="button"
              (click)="setDensity('comfortable')"
              class="px-2.5 py-1 rounded-md font-medium transition-all"
              [class.bg-surface-container-lowest]="density() === 'comfortable'"
              [class.dark:bg-slate-700]="density() === 'comfortable'"
              [class.shadow-xs]="density() === 'comfortable'"
              [class.text-on-surface]="density() === 'comfortable'"
              [class.dark:text-white]="density() === 'comfortable'"
              [class.text-outline]="density() !== 'comfortable'"
            >
              Comfortable
            </button>
          </div>

          <ng-content select="[actions]"></ng-content>
        </div>
      </div>

      <!-- Table Body Slot -->
      <div class="overflow-x-auto" [class.table-compact]="density() === 'compact'">
        <ng-content></ng-content>
      </div>

      <!-- Footer / Pagination Slot -->
      <div
        class="px-5 py-3 border-t border-outline-variant dark:border-slate-800 flex items-center justify-between text-xs text-outline dark:text-slate-400 bg-surface-bright/20 dark:bg-slate-900/40"
      >
        <ng-content select="[footer]"></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .table-compact th,
      :host ::ng-deep .table-compact td {
        padding-top: 6px !important;
        padding-bottom: 6px !important;
      }
    `,
  ],
})
export class DataTableContainerComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();

  readonly density = signal<'compact' | 'comfortable'>('compact');
  readonly densityChanged = output<'compact' | 'comfortable'>();

  setDensity(d: 'compact' | 'comfortable'): void {
    this.density.set(d);
    this.densityChanged.emit(d);
  }
}
