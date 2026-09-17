import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { toErrorMessage } from '../../../core/utils/error.util';
import { injectIsBrowser } from '../../../core/utils/platform.util';
import {
  CategoryCoverage,
  SkillDemandMetric,
  SkillsGapSort,
  SkillsGapState,
} from '../models/skills-gap.model';
import { SkillsGapApiService } from '../services/skills-gap-api.service';

const initialState: SkillsGapState = {
  metrics: [],
  summary: null,
  upskilling: [],
  selectedCategory: null,
  searchQuery: '',
  sortBy: 'gap',
  hideInactive: true,
  // Prerendered pages show skeletons until the browser fetches live data.
  isLoading: true,
  error: null,
};

const availableSupply = (m: SkillDemandMetric): number => m.benchConsultantsCount + m.endingSoonCount;

const COMPARATORS: Record<SkillsGapSort, (a: SkillDemandMetric, b: SkillDemandMetric) => number> = {
  gap: (a, b) => b.gapScore - a.gapScore || b.openRfpCount - a.openRfpCount,
  demand: (a, b) => b.openRfpCount - a.openRfpCount || b.gapScore - a.gapScore,
  supply: (a, b) => availableSupply(b) - availableSupply(a) || a.skillName.localeCompare(b.skillName),
  velocity: (a, b) => a.placementVelocityDays - b.placementVelocityDays,
  name: (a, b) => a.skillName.localeCompare(b.skillName),
};

export const SkillsGapStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ metrics, selectedCategory, searchQuery, sortBy, hideInactive }) => ({
    categories: computed(() => [...new Set(metrics().map((m) => m.category))].sort()),

    filteredMetrics: computed(() => {
      const category = selectedCategory();
      const query = searchQuery().toLowerCase().trim();
      return metrics()
        .filter(
          (m) =>
            (!category || m.category === category) &&
            (!query || m.skillName.toLowerCase().includes(query)) &&
            (!hideInactive() || m.openRfpCount > 0 || availableSupply(m) > 0),
        )
        .sort(COMPARATORS[sortBy()]);
    }),

    /** Scale maxima so colour intensity is comparable across the whole heatmap. */
    scale: computed(() => ({
      supply: Math.max(1, ...metrics().map((m) => Math.max(m.benchConsultantsCount, m.endingSoonCount))),
      demand: Math.max(1, ...metrics().map((m) => m.openRfpCount)),
      gap: Math.max(1, ...metrics().map((m) => Math.abs(m.gapScore))),
    })),

    shortages: computed(() => metrics().filter((m) => m.gapScore > 0).sort(COMPARATORS.gap)),

    /** Skills held by bench consultants that no open RFP asks for. */
    idleBenchSkills: computed(() =>
      metrics()
        .filter((m) => m.benchConsultantsCount > 0 && m.openRfpCount === 0)
        .sort((a, b) => b.benchConsultantsCount - a.benchConsultantsCount || (a.demandTrend === 'declining' ? -1 : 1)),
    ),

    risingDemand: computed(() =>
      metrics()
        .filter((m) => m.demandTrend === 'rising' && m.openRfpCount > 0)
        .sort(COMPARATORS.demand),
    ),

    categoryCoverage: computed<CategoryCoverage[]>(() => {
      const byCategory = new Map<string, CategoryCoverage>();
      for (const m of metrics()) {
        const entry = byCategory.get(m.category) ?? { category: m.category, supply: 0, demand: 0 };
        entry.supply += availableSupply(m);
        entry.demand += m.openRfpCount;
        byCategory.set(m.category, entry);
      }
      return [...byCategory.values()]
        .filter((c) => c.supply + c.demand > 0)
        .sort((a, b) => b.demand - a.demand || b.supply - a.supply);
    }),

    entityMap: computed(() => Object.fromEntries(metrics().map((m) => [m.id, m])) as Record<string, SkillDemandMetric>),
  })),
  withMethods((store, api = inject(SkillsGapApiService), isBrowser = injectIsBrowser()) => ({
    async load(): Promise<void> {
      if (!isBrowser) return;
      patchState(store, { isLoading: true, error: null });
      try {
        const { metrics, summary, upskilling } = await firstValueFrom(api.getSkillsGap());
        patchState(store, { metrics, summary, upskilling, isLoading: false });
      } catch (err: unknown) {
        patchState(store, { error: toErrorMessage(err, 'Failed to load skills analytics'), isLoading: false });
      }
    },

    setCategory(selectedCategory: string | null): void {
      patchState(store, { selectedCategory });
    },

    setSearchQuery(searchQuery: string): void {
      patchState(store, { searchQuery });
    },

    setSort(sortBy: SkillsGapSort): void {
      patchState(store, { sortBy });
    },

    toggleHideInactive(): void {
      patchState(store, (state) => ({ hideInactive: !state.hideInactive }));
    },
  })),
);
