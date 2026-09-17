import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { SessionState } from '../models/session.model';
import { WorkspaceApiService } from '../services/workspace-api.service';
import { toErrorMessage } from '../utils/error.util';
import { injectIsBrowser } from '../utils/platform.util';

const initialState: SessionState = {
  user: null,
  isLoading: false,
  error: null,
};

export const SessionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, api = inject(WorkspaceApiService), isBrowser = injectIsBrowser()) => ({
    async load(): Promise<void> {
      if (!isBrowser || store.user()) return;
      patchState(store, { isLoading: true, error: null });
      try {
        const user = await firstValueFrom(api.getCurrentUser());
        patchState(store, { user, isLoading: false });
      } catch (err: unknown) {
        patchState(store, { error: toErrorMessage(err, 'Failed to load profile'), isLoading: false });
      }
    },
  })),
);
