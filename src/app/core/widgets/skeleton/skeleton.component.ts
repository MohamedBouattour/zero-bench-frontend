import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 'text' | 'rect' | 'circle' | 'card' | 'table-row';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (variant() === 'card') {
      <!-- KPI / Stat Card Skeleton Placeholder -->
      <div
        class="p-5 rounded-2xl border border-outline-variant/60 dark:border-slate-800/60 bg-surface-container-lowest dark:bg-slate-900 space-y-4"
        [class.animate-pulse]="animated()"
      >
        <div class="flex items-center justify-between">
          <div class="h-3 w-24 rounded bg-slate-200/80 dark:bg-slate-800/80"></div>
          <div class="w-8 h-8 rounded-xl bg-slate-200/80 dark:bg-slate-800/80"></div>
        </div>
        <div class="h-7 w-32 rounded bg-slate-200/80 dark:bg-slate-800/80"></div>
        <div class="flex items-center gap-2 pt-1">
          <div class="h-3 w-16 rounded bg-slate-200/80 dark:bg-slate-800/80"></div>
          <div class="h-3 w-28 rounded bg-slate-200/80 dark:bg-slate-800/80"></div>
        </div>
      </div>
    } @else if (variant() === 'table-row') {
      <!-- Table Row Skeleton Placeholder (loops by count) -->
      @for (item of itemsArray(); track $index) {
        <tr class="border-b border-outline-variant/40 dark:border-slate-800/40" [class.animate-pulse]="animated()">
          @for (col of columnsArray(); track $index) {
            <td class="px-5 py-4">
              <div
                class="h-3.5 rounded bg-slate-200/80 dark:bg-slate-800/80"
                [style.width]="colWidths[$index % colWidths.length]"
              ></div>
            </td>
          }
        </tr>
      }
    } @else {
      <!-- Generic Single or Multi-Count Skeleton (Text, Circle, Rect) -->
      <div [ngClass]="wrapperClasses()">
        @for (item of itemsArray(); track $index) {
          <div
            [ngClass]="elementClasses()"
            [style.width]="width() || defaultWidth()"
            [style.height]="height() || defaultHeight()"
          ></div>
        }
      </div>
    }
  `,
})
export class SkeletonComponent {
  readonly variant = input<SkeletonVariant>('text');
  readonly width = input<string>('');
  readonly height = input<string>('');
  readonly count = input<number>(1);
  readonly animated = input<boolean>(true);
  readonly columns = input<number>(6);

  // Varied column widths for realistic table skeleton rendering
  readonly colWidths = ['65%', '45%', '55%', '75%', '40%', '50%'];

  readonly itemsArray = computed(() => Array.from({ length: Math.max(1, this.count()) }));
  readonly columnsArray = computed(() => Array.from({ length: Math.max(1, this.columns()) }));

  readonly defaultWidth = computed(() => {
    switch (this.variant()) {
      case 'circle':
        return '2.5rem';
      case 'rect':
        return '100%';
      case 'text':
      default:
        return '100%';
    }
  });

  readonly defaultHeight = computed(() => {
    switch (this.variant()) {
      case 'circle':
        return '2.5rem';
      case 'rect':
        return '4rem';
      case 'text':
      default:
        return '1rem';
    }
  });

  readonly wrapperClasses = computed(() => {
    if (this.count() > 1 && this.variant() === 'text') {
      return 'space-y-2.5 w-full';
    }
    return 'w-full';
  });

  readonly elementClasses = computed(() => {
    const base = 'bg-slate-200/80 dark:bg-slate-800/80 transition-colors';
    const anim = this.animated() ? 'animate-pulse' : '';

    switch (this.variant()) {
      case 'circle':
        return `${base} ${anim} rounded-full flex-shrink-0`;
      case 'rect':
        return `${base} ${anim} rounded-xl`;
      case 'text':
      default:
        return `${base} ${anim} rounded`;
    }
  });
}
