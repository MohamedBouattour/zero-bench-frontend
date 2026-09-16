import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { Consultant, ConsultantStatus } from '../../../core/models/consultant.model';
import { ConsultantsApiService } from '../services/consultants-api.service';

export interface ConsultantsState {
  consultants: Consultant[];
  filterStatus: ConsultantStatus | 'ALL';
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: ConsultantsState = {
  consultants: [],
  filterStatus: 'ALL',
  searchQuery: '',
  isLoading: false,
  error: null,
};

export const ConsultantsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ consultants, filterStatus, searchQuery }) => ({
    filteredConsultants: computed(() => {
      const list = consultants();
      const status = filterStatus();
      const query = searchQuery().toLowerCase().trim();

      return list.filter((c) => {
        const matchesStatus = status === 'ALL' || c.status === status;
        const matchesSearch =
          !query ||
          c.fullName.toLowerCase().includes(query) ||
          c.primarySkill.toLowerCase().includes(query) ||
          c.title.toLowerCase().includes(query);
        return matchesStatus && matchesSearch;
      });
    }),
    benchCount: computed(() => consultants().filter((c) => c.status === 'on_bench').length),
    onMissionCount: computed(() => consultants().filter((c) => c.status === 'on_mission').length),
    endingSoonCount: computed(() => consultants().filter((c) => c.status === 'ending_soon').length),
    totalCount: computed(() => consultants().length),
  })),
  withMethods((store, api = inject(ConsultantsApiService)) => ({
    async loadAll(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const consultants = await firstValueFrom(api.getConsultants());
        patchState(store, { consultants, isLoading: false });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load consultants';
        patchState(store, { error: message, isLoading: false });
      }
    },

    setFilterStatus(filterStatus: ConsultantStatus | 'ALL'): void {
      patchState(store, { filterStatus });
    },

    setSearchQuery(searchQuery: string): void {
      patchState(store, { searchQuery });
    },

    async addConsultant(newConsultant: Partial<Consultant>): Promise<void> {
      patchState(store, { isLoading: true });
      try {
        const created = await firstValueFrom(api.createConsultant(newConsultant));
        patchState(store, (state) => ({
          consultants: [created, ...state.consultants],
          isLoading: false,
        }));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to add consultant';
        patchState(store, { error: message, isLoading: false });
      }
    },
  }))
);
