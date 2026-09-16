import { inject, computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { PlacementOpportunity } from '../../../core/models/placement.model';
import { PlacementsApiService } from '../services/placements-api.service';

export interface PlacementsState {
  opportunities: PlacementOpportunity[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PlacementsState = {
  opportunities: [],
  isLoading: false,
  error: null,
};

export const PlacementsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ opportunities }) => ({
    matchedList: computed(() => opportunities().filter((o) => o.stage === 'matched')),
    pitchSentList: computed(() => opportunities().filter((o) => o.stage === 'pitch_sent')),
    interviewingList: computed(() => opportunities().filter((o) => o.stage === 'interviewing')),
    signedList: computed(() => opportunities().filter((o) => o.stage === 'signed')),
  })),
  withMethods((store, api = inject(PlacementsApiService)) => ({
    async loadOpportunities(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const opportunities = await firstValueFrom(api.getPlacements());
        patchState(store, { opportunities, isLoading: false });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load placements';
        patchState(store, { error: message, isLoading: false });
      }
    },
  }))
);
