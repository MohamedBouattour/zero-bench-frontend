import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { NavigationStore } from '../../../core/stores/navigation.store';
import { toErrorMessage } from '../../../core/utils/error.util';
import { injectIsBrowser } from '../../../core/utils/platform.util';
import { WORKING_DAYS_PER_MONTH } from '../../consultants/models/consultant.model';
import { ConsultantsStore } from '../../consultants/stores/consultants.store';
import {
  PLACEMENT_STAGES,
  PipelineStats,
  PlacementOpportunity,
  PlacementPayload,
  PlacementsState,
  PlacementStage,
  PlacementUpdate,
} from '../models/placement.model';
import { PlacementsApiService } from '../services/placements-api.service';

const initialState: PlacementsState = {
  opportunities: [],
  searchQuery: '',
  clientFilter: 'ALL',
  // Prerendered pages show skeletons until the browser fetches live data.
  isLoading: true,
  isSaving: false,
  error: null,
};

export const PlacementsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ opportunities, searchQuery, clientFilter }) => {
    const filteredOpportunities = computed(() => {
      const query = searchQuery().toLowerCase().trim();
      const client = clientFilter();
      return opportunities().filter(
        (o) =>
          (client === 'ALL' || o.clientId === client) &&
          (!query ||
            o.consultantName.toLowerCase().includes(query) ||
            o.clientName.toLowerCase().includes(query) ||
            o.roleTitle.toLowerCase().includes(query)),
      );
    });

    return {
      filteredOpportunities,
      /** Board columns: most recently updated cards first. */
      byStage: computed(() => {
        const columns = Object.fromEntries(PLACEMENT_STAGES.map((stage) => [stage, [] as PlacementOpportunity[]])) as Record<
          PlacementStage,
          PlacementOpportunity[]
        >;
        for (const opportunity of filteredOpportunities()) {
          columns[opportunity.stage].push(opportunity);
        }
        for (const stage of PLACEMENT_STAGES) {
          columns[stage].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        }
        return columns;
      }),
      stats: computed<PipelineStats>(() => {
        const all = opportunities();
        const active = all.filter((o) => o.stage !== 'signed' && o.stage !== 'lost');
        const signedCount = all.filter((o) => o.stage === 'signed').length;
        const lostCount = all.filter((o) => o.stage === 'lost').length;
        const scored = active.filter((o) => o.matchScore !== undefined);
        return {
          activeCount: active.length,
          signedCount,
          lostCount,
          winRate: signedCount + lostCount ? Math.round((signedCount / (signedCount + lostCount)) * 100) : 0,
          pipelineMonthlyValue: active.reduce((sum, o) => sum + o.tjm * WORKING_DAYS_PER_MONTH, 0),
          averageMatchScore: scored.length
            ? Math.round(scored.reduce((sum, o) => sum + (o.matchScore ?? 0), 0) / scored.length)
            : 0,
        };
      }),
      clientOptions: computed(() =>
        [...new Map(opportunities().map((o) => [o.clientId, o.clientName])).entries()]
          .map(([id, name]) => ({ id, name }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      ),
      entityMap: computed(
        () => Object.fromEntries(opportunities().map((o) => [o.id, o])) as Record<string, PlacementOpportunity>,
      ),
    };
  }),
  withMethods(
    (
      store,
      api = inject(PlacementsApiService),
      navigation = inject(NavigationStore),
      consultants = inject(ConsultantsStore),
      isBrowser = injectIsBrowser(),
    ) => {
      const replace = (updated: PlacementOpportunity): void =>
        patchState(store, (state) => ({
          opportunities: state.opportunities.map((o) => (o.id === updated.id ? updated : o)),
        }));

      /** Signing moves the consultant on mission server-side: refresh dependent views. */
      const afterMutation = (stage?: PlacementStage): void => {
        void navigation.loadBadges();
        if (stage === 'signed') void consultants.loadAll();
      };

      return {
        async loadOpportunities(): Promise<void> {
          if (!isBrowser) return;
          patchState(store, { isLoading: true, error: null });
          try {
            const opportunities = await firstValueFrom(api.getPlacements());
            patchState(store, { opportunities, isLoading: false });
          } catch (err: unknown) {
            patchState(store, { error: toErrorMessage(err, 'Failed to load placements'), isLoading: false });
          }
        },

        setSearchQuery(searchQuery: string): void {
          patchState(store, { searchQuery });
        },

        setClientFilter(clientFilter: string): void {
          patchState(store, { clientFilter });
        },

        async create(payload: PlacementPayload): Promise<PlacementOpportunity> {
          patchState(store, { isSaving: true });
          try {
            const created = await firstValueFrom(api.createPlacement(payload));
            patchState(store, (state) => ({ opportunities: [created, ...state.opportunities] }));
            afterMutation(created.stage);
            return created;
          } catch (err: unknown) {
            throw new Error(toErrorMessage(err, 'Failed to create opportunity'));
          } finally {
            patchState(store, { isSaving: false });
          }
        },

        /** Optimistic stage move (drag & drop): the card jumps immediately and rolls back on failure. */
        async moveToStage(id: string, stage: PlacementStage): Promise<PlacementOpportunity> {
          const previous = store.opportunities().find((o) => o.id === id);
          if (!previous) throw new Error('Opportunity not found');
          if (previous.stage === stage) return previous;

          const now = new Date().toISOString();
          replace({ ...previous, stage, updatedAt: now, history: [...previous.history, { stage, at: now }] });
          try {
            const updated = await firstValueFrom(api.updatePlacement(id, { stage }));
            replace(updated);
            afterMutation(stage);
            return updated;
          } catch (err: unknown) {
            replace(previous);
            throw new Error(toErrorMessage(err, 'Failed to move opportunity'));
          }
        },

        async update(id: string, changes: PlacementUpdate): Promise<PlacementOpportunity> {
          patchState(store, { isSaving: true });
          try {
            const updated = await firstValueFrom(api.updatePlacement(id, changes));
            replace(updated);
            afterMutation(changes.stage);
            return updated;
          } catch (err: unknown) {
            throw new Error(toErrorMessage(err, 'Failed to update opportunity'));
          } finally {
            patchState(store, { isSaving: false });
          }
        },

        async remove(id: string): Promise<void> {
          patchState(store, { isSaving: true });
          try {
            await firstValueFrom(api.deletePlacement(id));
            patchState(store, (state) => ({ opportunities: state.opportunities.filter((o) => o.id !== id) }));
            afterMutation();
          } catch (err: unknown) {
            throw new Error(toErrorMessage(err, 'Failed to delete opportunity'));
          } finally {
            patchState(store, { isSaving: false });
          }
        },
      };
    },
  ),
);
