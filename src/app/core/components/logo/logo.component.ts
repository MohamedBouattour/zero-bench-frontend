import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-3 select-none group">
      <!-- App Icon / Logo Mark -->
      <div
        class="relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-sm transition-transform duration-300 group-hover:scale-105"
        [class.w-8]="size() === 'sm'"
        [class.h-8]="size() === 'sm'"
        [class.w-10]="size() === 'md'"
        [class.h-10]="size() === 'md'"
        [class.w-12]="size() === 'lg'"
        [class.h-12]="size() === 'lg'"
      >
        <img
          src="/logo.png"
          alt="BenchZero Logo"
          class="w-full h-full object-cover rounded-xl"
        />
        <div class="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20 pointer-events-none"></div>
      </div>

      <!-- Brand Text -->
      @if (showText()) {
        <div class="leading-tight">
          <div class="flex items-center gap-1.5">
            <span
              class="font-extrabold tracking-tight text-on-surface dark:text-white"
              [class.text-sm]="size() === 'sm'"
              [class.text-base]="size() === 'md'"
              [class.text-lg]="size() === 'lg'"
            >
              Bench<span class="text-secondary-blue dark:text-blue-400">Zero</span>
            </span>
            <span class="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-blue-100 dark:bg-blue-950/80 text-secondary-blue dark:text-blue-300 tracking-wider">
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
}
