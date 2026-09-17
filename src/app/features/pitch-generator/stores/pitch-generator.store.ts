import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { toErrorMessage } from '../../../core/utils/error.util';
import { injectIsBrowser } from '../../../core/utils/platform.util';
import { ClientsApiService } from '../../customers/services/clients-api.service';
import { PitchGeneratorState, PitchRequest, PitchResponse } from '../models/pitch-generator.model';
import { PitchGeneratorApiService } from '../services/pitch-generator-api.service';

const initialState: PitchGeneratorState = {
  rfps: [],
  rfpsClientId: null,
  isLoadingRfps: false,
  lastRequest: null,
  lastResponse: null,
  isGenerating: false,
  error: null,
};

export const PitchGeneratorStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods(
    (
      store,
      api = inject(PitchGeneratorApiService),
      clientsApi = inject(ClientsApiService),
      isBrowser = injectIsBrowser(),
    ) => ({
      /** Loads the open RFPs of the selected client account. */
      async loadRfps(clientId: string | null): Promise<void> {
        if (!clientId) {
          patchState(store, { rfps: [], rfpsClientId: null });
          return;
        }
        if (!isBrowser || store.rfpsClientId() === clientId) return;
        patchState(store, { isLoadingRfps: true, rfps: [], rfpsClientId: clientId });
        try {
          const detail = await firstValueFrom(clientsApi.getClientDetail(clientId));
          // Ignore stale responses if the user switched client meanwhile.
          if (store.rfpsClientId() === clientId) {
            patchState(store, { rfps: detail.rfps.filter((r) => r.status === 'open'), isLoadingRfps: false });
          }
        } catch {
          patchState(store, { isLoadingRfps: false, rfpsClientId: null });
        }
      },

      async generate(request: PitchRequest): Promise<PitchResponse | null> {
        patchState(store, { isGenerating: true, error: null, lastRequest: request });
        try {
          const lastResponse = await firstValueFrom(api.generatePitch(request));
          patchState(store, { lastResponse, isGenerating: false });
          return lastResponse;
        } catch (err: unknown) {
          patchState(store, { error: toErrorMessage(err, 'Pitch generation failed'), isGenerating: false });
          return null;
        }
      },

      reset(): void {
        patchState(store, { lastRequest: null, lastResponse: null, error: null });
      },
    }),
  ),
);
