import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AppNotification, NotificationType } from '../../models/notification.model';
import { LanguageStore } from '../../stores/language.store';
import { NotificationsStore } from '../../stores/notifications.store';

const TYPE_STYLES: Record<NotificationType, { icon: string; classes: string }> = {
  bench_alert: { icon: 'person_alert', classes: 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400' },
  contract_ending: { icon: 'event_busy', classes: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400' },
  ai_match: { icon: 'auto_awesome', classes: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400' },
  placement: { icon: 'view_kanban', classes: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' },
};

@Component({
  selector: 'app-notifications-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  host: {
    class: 'relative inline-block',
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'isOpen.set(false)',
  },
  template: `
    <button
      type="button"
      (click)="toggle()"
      class="p-2 text-on-surface-variant dark:text-slate-300 hover:bg-surface-container-high dark:hover:bg-slate-800 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-secondary-blue/40"
      [attr.aria-label]="t().header.notifications + (store.unreadCount() ? ' (' + store.unreadCount() + ')' : '')"
      aria-haspopup="true"
      [attr.aria-expanded]="isOpen()"
    >
      <span class="material-symbols-outlined text-[20px] block">notifications</span>
      @if (store.unreadCount() > 0) {
        <span
          class="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-4 text-center ring-2 ring-white dark:ring-slate-950"
        >
          {{ store.unreadCount() }}
        </span>
      }
    </button>

    @if (isOpen()) {
      <div
        class="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-outline-variant dark:border-slate-800 bg-surface-container-lowest dark:bg-slate-900 shadow-xl overflow-hidden"
        role="menu"
      >
        <div class="flex items-center justify-between px-4 py-3 border-b border-outline-variant/70 dark:border-slate-800">
          <span class="text-xs font-bold text-on-surface dark:text-white">{{ t().header.notifications }}</span>
          @if (store.unreadCount() > 0) {
            <button
              type="button"
              (click)="store.markAllAsRead()"
              class="text-[11px] font-semibold text-secondary-blue dark:text-blue-400 hover:underline"
            >
              {{ t().header.markAllRead }}
            </button>
          }
        </div>

        <ul class="max-h-96 overflow-y-auto divide-y divide-outline-variant/50 dark:divide-slate-800/70">
          @for (notification of store.notifications(); track notification.id) {
            @let style = typeStyles[notification.type];
            <li>
              <button
                type="button"
                role="menuitem"
                (click)="open(notification)"
                class="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-surface-container-low dark:hover:bg-slate-800/60 transition-colors"
              >
                <span class="p-1.5 rounded-lg shrink-0" [class]="style.classes">
                  <span class="material-symbols-outlined text-[16px] block">{{ style.icon }}</span>
                </span>
                <span class="flex-1 min-w-0">
                  <span class="flex items-center gap-2">
                    <span class="text-xs font-semibold text-on-surface dark:text-white truncate">{{ notification.title }}</span>
                    @if (!notification.read) {
                      <span class="w-1.5 h-1.5 rounded-full bg-secondary-blue dark:bg-blue-400 shrink-0" aria-label="Unread"></span>
                    }
                  </span>
                  <span class="block text-[11px] text-on-surface-variant dark:text-slate-400 mt-0.5 leading-snug">
                    {{ notification.message }}
                  </span>
                  <span class="block text-[10px] text-outline dark:text-slate-500 mt-1">
                    {{ notification.createdAt | date: 'MMM d, HH:mm' }}
                  </span>
                </span>
              </button>
            </li>
          } @empty {
            <li class="px-4 py-8 text-center text-xs text-outline dark:text-slate-400">
              @if (store.isLoading()) {
                Loading…
              } @else {
                {{ t().header.noNotifications }}
              }
            </li>
          }
        </ul>
      </div>
    }
  `,
})
export class NotificationsMenuComponent {
  protected readonly store = inject(NotificationsStore);
  protected readonly t = inject(LanguageStore).translations;
  protected readonly typeStyles = TYPE_STYLES;
  protected readonly isOpen = signal(false);

  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    void this.store.load();
  }

  protected toggle(): void {
    this.isOpen.update((open) => !open);
  }

  protected open(notification: AppNotification): void {
    void this.store.markAsRead(notification.id);
    this.isOpen.set(false);
    void this.router.navigate([notification.route], { queryParams: notification.queryParams });
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (this.isOpen() && !this.host.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
    }
  }
}
