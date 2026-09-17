/**
 * Heatmap colour scales (Tailwind class literals so the compiler can see them).
 *
 * - Supply (available consultants): sequential blue, light → dark (dark mode steps get brighter).
 * - Demand (open RFPs): sequential orange, the second sequential context.
 * - Gap: diverging red (shortage) ↔ blue (surplus) around a neutral gray zero.
 *
 * Blue #2a78d6 / orange #eb6834 (dark #3987e5 / #d95926) pass the colour-blind and contrast checks
 * on both card surfaces. Every cell also prints its number, so colour is never the only encoding.
 */

const SEQUENTIAL_ZERO = 'bg-slate-50 text-slate-400 dark:bg-slate-800/40 dark:text-slate-500';
const DIVERGING_ZERO = 'bg-[#f0efec] text-slate-500 dark:bg-[#383835] dark:text-slate-300';

export const SUPPLY_STEPS = [
  'bg-[#cde2fb] text-slate-900 dark:bg-[#0d366b] dark:text-white',
  'bg-[#86b6ef] text-slate-900 dark:bg-[#1c5cab] dark:text-white',
  'bg-[#2a78d6] text-white dark:bg-[#3987e5] dark:text-white',
  'bg-[#184f95] text-white dark:bg-[#86b6ef] dark:text-slate-950',
] as const;

export const DEMAND_STEPS = [
  'bg-orange-100 text-slate-900 dark:bg-orange-950 dark:text-white',
  'bg-orange-300 text-slate-900 dark:bg-orange-800 dark:text-white',
  'bg-[#eb6834] text-slate-950 dark:bg-[#d95926] dark:text-white',
  'bg-orange-800 text-white dark:bg-orange-400 dark:text-slate-950',
] as const;

const SHORTAGE_STEPS = [
  'bg-red-100 text-slate-900 dark:bg-red-950 dark:text-white',
  'bg-red-300 text-slate-900 dark:bg-red-800 dark:text-white',
  'bg-red-600 text-white dark:bg-red-500 dark:text-white',
] as const;

const SURPLUS_STEPS = [
  'bg-[#cde2fb] text-slate-900 dark:bg-[#0d366b] dark:text-white',
  'bg-[#86b6ef] text-slate-900 dark:bg-[#1c5cab] dark:text-white',
  'bg-[#2a78d6] text-white dark:bg-[#3987e5] dark:text-white',
] as const;

function step(value: number, max: number, steps: readonly string[]): string {
  const index = Math.min(steps.length - 1, Math.ceil((value / Math.max(1, max)) * steps.length) - 1);
  return steps[Math.max(0, index)];
}

export function sequentialClass(value: number, max: number, steps: readonly string[]): string {
  return value <= 0 ? SEQUENTIAL_ZERO : step(value, max, steps);
}

export function gapClass(gap: number, maxAbs: number): string {
  if (gap === 0) return DIVERGING_ZERO;
  return gap > 0 ? step(gap, maxAbs, SHORTAGE_STEPS) : step(-gap, maxAbs, SURPLUS_STEPS);
}

/** Legend swatches, in scale order. */
export const LEGENDS = {
  supply: [SEQUENTIAL_ZERO, ...SUPPLY_STEPS],
  demand: [SEQUENTIAL_ZERO, ...DEMAND_STEPS],
  gap: [...[...SURPLUS_STEPS].reverse(), DIVERGING_ZERO, ...SHORTAGE_STEPS],
} as const;
