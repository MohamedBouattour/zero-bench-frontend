import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { toErrorMessage } from '../../../core/utils/error.util';
import { injectIsBrowser } from '../../../core/utils/platform.util';
import { BenchRiskState, RiskPeriod } from '../models/bench-risk.model';
import { BenchRiskApiService } from '../services/bench-risk-api.service';

const initialState: BenchRiskState = {
  period: 'month',
  metrics: null,
  highRiskConsultants: [],
  recommendation: null,
  // Prerendered pages show skeletons until the browser fetches live data.
  isLoading: true,
  error: null,
};

export const BenchRiskStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ highRiskConsultants }) => ({
    consultantMap: computed(() => new Map(highRiskConsultants().map((c) => [c.id, c]))),
  })),
  withMethods((store, api = inject(BenchRiskApiService), isBrowser = injectIsBrowser()) => {
    const loadOverview = async (): Promise<void> => {
      if (!isBrowser) return;
      patchState(store, { isLoading: true, error: null });
      try {
        const data = await firstValueFrom(api.getRiskOverview(store.period()));
        patchState(store, {
          metrics: data.metrics,
          highRiskConsultants: data.highRiskConsultants,
          recommendation: data.recommendation,
          isLoading: false,
        });
      } catch (err: unknown) {
        patchState(store, { error: toErrorMessage(err, 'Failed to load risk overview'), isLoading: false });
      }
    };

    return {
      loadOverview,
      setPeriod(period: RiskPeriod): void {
        if (period === store.period()) return;
        patchState(store, { period });
        void loadOverview();
      },
    };
  }),
);
