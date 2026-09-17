import { DEMAND_STEPS, SUPPLY_STEPS, gapClass, sequentialClass } from './heatmap-scale';

describe('heatmap scales', () => {
  it('keeps zero values neutral', () => {
    expect(sequentialClass(0, 4, SUPPLY_STEPS)).toContain('bg-slate-50');
    expect(gapClass(0, 3)).toContain('bg-[#f0efec]');
  });

  it('maps magnitude to increasingly dark sequential steps', () => {
    expect(sequentialClass(1, 4, SUPPLY_STEPS)).toBe(SUPPLY_STEPS[0]);
    expect(sequentialClass(2, 4, SUPPLY_STEPS)).toBe(SUPPLY_STEPS[1]);
    expect(sequentialClass(4, 4, DEMAND_STEPS)).toBe(DEMAND_STEPS[3]);
    expect(sequentialClass(9, 4, DEMAND_STEPS)).toBe(DEMAND_STEPS[3]);
  });

  it('uses red for shortages and blue for surpluses', () => {
    expect(gapClass(1, 1)).toContain('bg-red-600');
    expect(gapClass(-1, 1)).toContain('bg-[#2a78d6]');
    expect(gapClass(1, 3)).toContain('bg-red-100');
  });
});
