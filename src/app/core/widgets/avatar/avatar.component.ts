import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

const TONES = [
  'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300',
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300',
  'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
] as const;

const SIZES: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-[9px]',
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-14 h-14 text-base',
};

/** Initials avatar with a stable colour derived from the name. Decorative: the name is always shown nearby. */
@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0', 'aria-hidden': 'true' },
  template: `
    <span
      class="inline-flex items-center justify-center rounded-full font-bold select-none ring-1 ring-black/5 dark:ring-white/5"
      [class]="classes()"
    >
      {{ initials() }}
    </span>
  `,
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly size = input<AvatarSize>('sm');

  protected readonly initials = computed(() =>
    this.name()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase(),
  );

  protected readonly classes = computed(() => {
    const hash = [...this.name()].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) >>> 0, 7);
    return `${SIZES[this.size()]} ${TONES[hash % TONES.length]}`;
  });
}
