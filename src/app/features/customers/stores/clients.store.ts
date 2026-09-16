import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { ClientsState } from '../models/customer.model';
import { ClientsApiService } from '../services/clients-api.service';

const initialState: ClientsState = {
  clients: [],
  isLoading: false,
  error: null,
};

export const ClientsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, api = inject(ClientsApiService)) => ({
    async loadClients(): Promise<void> {
      patchState(store, { isLoading: true, error: null });
      try {
        const clients = await firstValueFrom(api.getClients());
        patchState(store, { clients, isLoading: false });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to load clients';
        patchState(store, { error: message, isLoading: false });
      }
    },
  }))
);
