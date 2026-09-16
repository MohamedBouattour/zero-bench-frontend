import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { RiskMetrics } from '../../../core/models/risk.model';
import { Consultant } from '../../../core/models/consultant.model';
import { BenchRiskApiService } from '../services/bench-risk-api.service';

export interface BenchRiskState {
  metrics: RiskMetrics | null;
  highRiskConsultants: Consultant[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BenchRiskState = {
  metrics: null,
  highRiskConsultants: [],
  isLoading: false,
  error: null,
};

export const BenchRiskStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, api = inject(BenchRiskApiService)) => ({
    async loadOverview(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const data = await firstValueFrom(api.getRiskOverview());
        patchState(store, {
          metrics: data.metrics,
          highRiskConsultants: data.highRiskConsultants,
          isLoading: false,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load risk overview';
        patchState(store, { error: message, isLoading: false });
      }
    },
  }))
);
