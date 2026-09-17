import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const SIZES = {
  sm: { box: 'w-8 h-8', text: 'text-sm', px: 32 },
  md: { box: 'w-10 h-10', text: 'text-base', px: 40 },
  lg: { box: 'w-12 h-12', text: 'text-lg', px: 48 },
} as const;

@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  template: `
    <div class="flex items-center gap-3 select-none group">
      <!-- App Icon / Logo Mark -->
      <div
        class="relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm transition-transform duration-300 group-hover:scale-105"
        [class]="sizing().box"
      >
        <img
          ngSrc="/logo.png"
          alt="BenchZero Logo"
          [width]="sizing().px"
          [height]="sizing().px"
          priority
          class="w-full h-full object-cover rounded-xl"
        />
        <div class="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 pointer-events-none"></div>
      </div>

      <!-- Brand Text -->
      @if (showText()) {
        <div class="leading-tight">
          <div class="flex items-center gap-1.5">
            <span class="font-extrabold tracking-tight text-on-surface dark:text-white" [class]="sizing().text">
              Bench<span class="text-secondary-blue dark:text-blue-400">Zero</span>
            </span>
            <span
              class="px-1.5 py-px rounded text-[9px] font-extrabold uppercase bg-blue-100 dark:bg-blue-950/80 text-secondary-blue dark:text-blue-300 tracking-wider"
            >
              ERP
            </span>
          </div>
          @if (subtitle()) {
            <p class="text-[10px] font-medium text-outline dark:text-slate-400">
              {{ subtitle() }}
            </p>
          }
        </div>
      }
    </div>
  `,
})
export class LogoComponent {
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly showText = input<boolean>(true);
  readonly subtitle = input<string>('ESN Intelligence');

  protected readonly sizing = computed(() => SIZES[this.size()]);
}
