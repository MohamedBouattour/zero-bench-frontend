import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** For table placeholders use `<tbody appSkeletonRows>` (SkeletonRowsComponent). */
export type SkeletonVariant = 'text' | 'rect' | 'circle' | 'card';

const BLOCK = 'bg-slate-200/80 dark:bg-slate-800/80';

@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    @if (variant() === 'card') {
      <!-- KPI / Stat Card Skeleton Placeholder -->
      <div
        class="p-5 rounded-2xl border border-outline-variant/60 dark:border-slate-800/60 bg-surface-container-lowest dark:bg-slate-900 space-y-4"
        [class.animate-pulse]="animated()"
        aria-hidden="true"
      >
        <div class="flex items-center justify-between">
          <div class="h-3 w-24 rounded {{ block }}"></div>
          <div class="w-8 h-8 rounded-xl {{ block }}"></div>
        </div>
        <div class="h-7 w-32 rounded {{ block }}"></div>
        <div class="flex items-center gap-2 pt-1">
          <div class="h-3 w-16 rounded {{ block }}"></div>
          <div class="h-3 w-28 rounded {{ block }}"></div>
        </div>
      </div>
    } @else {
      <!-- Generic Single or Multi-Count Skeleton (Text, Circle, Rect) -->
      <div [class]="wrapperClasses()" aria-hidden="true">
        @for (item of itemsArray(); track $index) {
          <div
            [class]="elementClasses()"
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

  protected readonly block = BLOCK;

  protected readonly itemsArray = computed(() => Array.from({ length: Math.max(1, this.count()) }));

  protected readonly defaultWidth = computed(() => (this.variant() === 'circle' ? '2.5rem' : '100%'));

  protected readonly defaultHeight = computed(() => {
    switch (this.variant()) {
      case 'circle':
        return '2.5rem';
      case 'rect':
        return '4rem';
      default:
        return '1rem';
    }
  });

  protected readonly wrapperClasses = computed(() => {
    if (this.variant() === 'circle') return 'block shrink-0';
    return this.count() > 1 && this.variant() === 'text' ? 'block w-full space-y-2.5' : 'block w-full';
  });

  protected readonly elementClasses = computed(() => {
    const base = `${BLOCK} transition-colors ${this.animated() ? 'animate-pulse' : ''}`;
    switch (this.variant()) {
      case 'circle':
        return `${base} rounded-full shrink-0`;
      case 'rect':
        return `${base} rounded-xl`;
      default:
        return `${base} rounded`;
    }
  });
}
