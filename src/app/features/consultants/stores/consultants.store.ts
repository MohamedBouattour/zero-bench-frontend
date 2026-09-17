import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { NavigationStore } from '../../../core/stores/navigation.store';
import { toErrorMessage } from '../../../core/utils/error.util';
import { injectIsBrowser } from '../../../core/utils/platform.util';
import {
  CONSULTANT_SENIORITIES,
  Consultant,
  ConsultantPayload,
  ConsultantSortField,
  ConsultantsState,
  ConsultantStatusFilter,
} from '../models/consultant.model';
import { ConsultantsApiService } from '../services/consultants-api.service';

const initialState: ConsultantsState = {
  consultants: [],
  filterStatus: 'ALL',
  searchQuery: '',
  sort: { field: 'availability', direction: 'asc' },
  // Prerendered pages show skeletons until the browser fetches live data.
  isLoading: true,
  isSaving: false,
  error: null,
};

const STATUS_PRIORITY: Record<Consultant['status'], number> = {
  on_bench: 0,
  ending_soon: 1,
  prospect: 2,
  on_mission: 3,
};

/** Bench first (longest bench on top), then the soonest mission end. */
function availabilityRank(a: Consultant, b: Consultant): number {
  const byStatus = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
  if (byStatus !== 0) return byStatus;
  if (a.status === 'on_bench') return (b.daysOnBench ?? 0) - (a.daysOnBench ?? 0);
  return (a.missionEndDate ?? '').localeCompare(b.missionEndDate ?? '');
}

const COMPARATORS: Record<ConsultantSortField, (a: Consultant, b: Consultant) => number> = {
  fullName: (a, b) => a.fullName.localeCompare(b.fullName),
  seniority: (a, b) => CONSULTANT_SENIORITIES.indexOf(a.seniority) - CONSULTANT_SENIORITIES.indexOf(b.seniority),
  tjm: (a, b) => a.tjm - b.tjm,
  availability: availabilityRank,
};

export const ConsultantsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ consultants, filterStatus, searchQuery, sort }) => ({
    filteredConsultants: computed(() => {
      const status = filterStatus();
      const query = searchQuery().toLowerCase().trim();
      const { field, direction } = sort();
      const compare = COMPARATORS[field];

      return consultants()
        .filter((c) => {
          const matchesStatus = status === 'ALL' || c.status === status;
          const matchesSearch =
            !query ||
            c.fullName.toLowerCase().includes(query) ||
            c.primarySkill.toLowerCase().includes(query) ||
            c.title.toLowerCase().includes(query) ||
            c.skills.some((skill) => skill.toLowerCase().includes(query));
          return matchesStatus && matchesSearch;
        })
        .sort((a, b) => (direction === 'asc' ? compare(a, b) : compare(b, a)));
    }),
    entityMap: computed(() => Object.fromEntries(consultants().map((c) => [c.id, c])) as Record<string, Consultant>),
    /** Consultants who can be staffed: bench first, then missions ending soon. */
    availableConsultants: computed(() =>
      consultants()
        .filter((c) => c.status === 'on_bench' || c.status === 'ending_soon')
        .sort(availabilityRank),
    ),
    benchCount: computed(() => consultants().filter((c) => c.status === 'on_bench').length),
    onMissionCount: computed(() => consultants().filter((c) => c.status === 'on_mission').length),
    endingSoonCount: computed(() => consultants().filter((c) => c.status === 'ending_soon').length),
    prospectCount: computed(() => consultants().filter((c) => c.status === 'prospect').length),
    totalCount: computed(() => consultants().length),
  })),
  withMethods(
    (
      store,
      api = inject(ConsultantsApiService),
      navigation = inject(NavigationStore),
      isBrowser = injectIsBrowser(),
    ) => ({
      async loadAll(): Promise<void> {
        if (!isBrowser) return;
        patchState(store, { isLoading: true, error: null });
        try {
          const consultants = await firstValueFrom(api.getConsultants());
          patchState(store, { consultants, isLoading: false });
        } catch (err: unknown) {
          patchState(store, { error: toErrorMessage(err, 'Failed to load consultants'), isLoading: false });
        }
      },

      setFilterStatus(filterStatus: ConsultantStatusFilter): void {
        patchState(store, { filterStatus });
      },

      setSearchQuery(searchQuery: string): void {
        patchState(store, { searchQuery });
      },

      /** Clicking the active column flips the direction; a new column starts ascending. */
      toggleSort(field: ConsultantSortField): void {
        const { sort } = store;
        const direction = sort().field === field && sort().direction === 'asc' ? 'desc' : 'asc';
        patchState(store, { sort: { field, direction } });
      },

      async create(payload: ConsultantPayload): Promise<Consultant> {
        patchState(store, { isSaving: true });
        try {
          const created = await firstValueFrom(api.createConsultant(payload));
          patchState(store, (state) => ({ consultants: [created, ...state.consultants] }));
          void navigation.loadBadges();
          return created;
        } catch (err: unknown) {
          throw new Error(toErrorMessage(err, 'Failed to create consultant'));
        } finally {
          patchState(store, { isSaving: false });
        }
      },

      async update(id: string, payload: ConsultantPayload): Promise<Consultant> {
        patchState(store, { isSaving: true });
        try {
          const updated = await firstValueFrom(api.updateConsultant(id, payload));
          patchState(store, (state) => ({
            consultants: state.consultants.map((c) => (c.id === id ? updated : c)),
          }));
          void navigation.loadBadges();
          return updated;
        } catch (err: unknown) {
          throw new Error(toErrorMessage(err, 'Failed to update consultant'));
        } finally {
          patchState(store, { isSaving: false });
        }
      },

      async remove(id: string): Promise<void> {
        patchState(store, { isSaving: true });
        try {
          await firstValueFrom(api.deleteConsultant(id));
          patchState(store, (state) => ({ consultants: state.consultants.filter((c) => c.id !== id) }));
          void navigation.loadBadges();
        } catch (err: unknown) {
          throw new Error(toErrorMessage(err, 'Failed to delete consultant'));
        } finally {
          patchState(store, { isSaving: false });
        }
      },
    }),
  ),
);
