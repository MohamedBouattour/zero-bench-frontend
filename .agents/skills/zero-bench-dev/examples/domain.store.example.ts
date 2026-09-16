/**
 * Standard DDD Feature NgRx SignalStore Template
 * Location: src/app/features/<domain>/stores/<domain>.store.ts
 */

import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { DomainEntity, DomainFeatureState, DomainFilterParams } from '../models/domain.model';
import { DomainApiService } from '../services/domain-api.service';

const initialState: DomainFeatureState = {
  items: [],
  selectedId: null,
  filters: {
    status: '',
    search: '',
  },
  isLoading: false,
  error: null,
};

export const DomainStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ items, selectedId }) => ({
    totalCount: computed(() => items().length),
    selectedItem: computed(() => items().find((item) => item.id === selectedId()) ?? null),
  })),
  withMethods((store, api = inject(DomainApiService)) => ({
    async loadAll(filters?: DomainFilterParams): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const items = await firstValueFrom(api.getItems(filters ?? store.filters()));
        patchState(store, { items, isLoading: false });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load domain entities';
        patchState(store, { error: errorMsg, isLoading: false });
      }
    },
    selectItem(id: string | null): void {
      patchState(store, { selectedId: id });
    },
    setFilters(filters: DomainFilterParams): void {
      patchState(store, { filters });
      void this.loadAll(filters);
    },
  }))
);
