import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { NotificationsState } from '../models/notification.model';
import { WorkspaceApiService } from '../services/workspace-api.service';
import { toErrorMessage } from '../utils/error.util';
import { injectIsBrowser } from '../utils/platform.util';

const initialState: NotificationsState = {
  notifications: [],
  isLoading: false,
  error: null,
};

export const NotificationsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ notifications }) => ({
    unreadCount: computed(() => notifications().filter((n) => !n.read).length),
  })),
  withMethods((store, api = inject(WorkspaceApiService), isBrowser = injectIsBrowser()) => ({
    async load(): Promise<void> {
      if (!isBrowser) return;
      patchState(store, { isLoading: true, error: null });
      try {
        const notifications = await firstValueFrom(api.getNotifications());
        patchState(store, { notifications, isLoading: false });
      } catch (err: unknown) {
        patchState(store, { error: toErrorMessage(err, 'Failed to load notifications'), isLoading: false });
      }
    },

    async markAsRead(id: string): Promise<void> {
      const target = store.notifications().find((n) => n.id === id);
      if (!target || target.read) return;
      patchState(store, (state) => ({
        notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      }));
      try {
        await firstValueFrom(api.markNotificationRead(id));
      } catch {
        patchState(store, (state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: false } : n)),
        }));
      }
    },

    async markAllAsRead(): Promise<void> {
      const previous = store.notifications();
      patchState(store, { notifications: previous.map((n) => ({ ...n, read: true })) });
      try {
        await firstValueFrom(api.markAllNotificationsRead());
      } catch {
        patchState(store, { notifications: previous });
      }
    },
  })),
);
