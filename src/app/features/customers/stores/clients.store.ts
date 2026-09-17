import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { toErrorMessage } from '../../../core/utils/error.util';
import { injectIsBrowser } from '../../../core/utils/platform.util';
import {
  ClientAccount,
  ClientDetail,
  ClientPayload,
  ClientsState,
  ClientStatusFilter,
  RfpPayload,
} from '../models/customer.model';
import { ClientsApiService } from '../services/clients-api.service';

const initialState: ClientsState = {
  clients: [],
  selectedClient: null,
  searchQuery: '',
  filterStatus: 'ALL',
  // Prerendered pages show skeletons until the browser fetches live data.
  isLoading: true,
  isDetailLoading: false,
  isSaving: false,
  error: null,
};

export const ClientsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ clients, searchQuery, filterStatus }) => ({
    filteredClients: computed(() => {
      const query = searchQuery().toLowerCase().trim();
      const status = filterStatus();
      return clients().filter(
        (c) =>
          (status === 'ALL' || c.status === status) &&
          (!query || c.name.toLowerCase().includes(query) || c.industry.toLowerCase().includes(query)),
      );
    }),
    entityMap: computed(() => Object.fromEntries(clients().map((c) => [c.id, c])) as Record<string, ClientAccount>),
    totals: computed(() =>
      clients().reduce(
        (acc, c) => ({
          activeAccounts: acc.activeAccounts + (c.status === 'active' ? 1 : 0),
          staffedConsultants: acc.staffedConsultants + c.activeConsultants,
          monthlyRevenue: acc.monthlyRevenue + c.monthlyRevenue,
          openRfps: acc.openRfps + c.openRFPs,
        }),
        { activeAccounts: 0, staffedConsultants: 0, monthlyRevenue: 0, openRfps: 0 },
      ),
    ),
  })),
  withMethods((store, api = inject(ClientsApiService), isBrowser = injectIsBrowser()) => {
    /** Keeps the list row in sync with a freshly fetched account. */
    const upsertClient = (client: ClientAccount): void => {
      const exists = store.clients().some((c) => c.id === client.id);
      const { id, name, industry, status, city, contactName, contactEmail, accountSince, activeConsultants, openRFPs, monthlyRevenue } = client;
      const row: ClientAccount = { id, name, industry, status, city, contactName, contactEmail, accountSince, activeConsultants, openRFPs, monthlyRevenue };
      patchState(store, (state) => ({
        clients: exists ? state.clients.map((c) => (c.id === id ? row : c)) : [row, ...state.clients],
      }));
    };

    return {
      async loadClients(): Promise<void> {
        if (!isBrowser) return;
        patchState(store, { isLoading: true, error: null });
        try {
          const clients = await firstValueFrom(api.getClients());
          patchState(store, { clients, isLoading: false });
        } catch (err: unknown) {
          patchState(store, { error: toErrorMessage(err, 'Failed to load clients'), isLoading: false });
        }
      },

      async loadDetail(id: string): Promise<ClientDetail | null> {
        if (!isBrowser) return null;
        if (store.selectedClient()?.id !== id) patchState(store, { selectedClient: null });
        patchState(store, { isDetailLoading: true });
        try {
          const detail = await firstValueFrom(api.getClientDetail(id));
          patchState(store, { selectedClient: detail, isDetailLoading: false });
          return detail;
        } catch {
          patchState(store, { isDetailLoading: false });
          return null;
        }
      },

      clearDetail(): void {
        patchState(store, { selectedClient: null });
      },

      setSearchQuery(searchQuery: string): void {
        patchState(store, { searchQuery });
      },

      setFilterStatus(filterStatus: ClientStatusFilter): void {
        patchState(store, { filterStatus });
      },

      async create(payload: ClientPayload): Promise<ClientAccount> {
        patchState(store, { isSaving: true });
        try {
          const created = await firstValueFrom(api.createClient(payload));
          upsertClient(created);
          return created;
        } catch (err: unknown) {
          throw new Error(toErrorMessage(err, 'Failed to create client'));
        } finally {
          patchState(store, { isSaving: false });
        }
      },

      async update(id: string, payload: ClientPayload): Promise<ClientAccount> {
        patchState(store, { isSaving: true });
        try {
          const updated = await firstValueFrom(api.updateClient(id, payload));
          upsertClient(updated);
          const selected = store.selectedClient();
          if (selected?.id === id) patchState(store, { selectedClient: { ...selected, ...updated } });
          return updated;
        } catch (err: unknown) {
          throw new Error(toErrorMessage(err, 'Failed to update client'));
        } finally {
          patchState(store, { isSaving: false });
        }
      },

      async addRfp(clientId: string, payload: RfpPayload): Promise<ClientDetail> {
        patchState(store, { isSaving: true });
        try {
          const detail = await firstValueFrom(api.addRfp(clientId, payload));
          patchState(store, { selectedClient: detail });
          upsertClient(detail);
          return detail;
        } catch (err: unknown) {
          throw new Error(toErrorMessage(err, 'Failed to add RFP'));
        } finally {
          patchState(store, { isSaving: false });
        }
      },
    };
  }),
);
