import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Toast, ToastOptions, ToastType } from '../models/toast.model';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly toastsState = signal<Toast[]>([]);
  readonly toasts = this.toastsState.asReadonly();

  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  /**
   * Display a new toast notification
   */
  show(type: ToastType, message: string, options?: ToastOptions): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = options?.duration ?? 4500;

    const newToast: Toast = {
      id,
      type,
      message,
      title: options?.title,
      duration,
      createdAt: Date.now(),
    };

    this.toastsState.update((current) => [...current, newToast]);

    // Setup auto-dismissal if duration is positive and in browser environment
    if (this.isBrowser && duration > 0) {
      const timer = setTimeout(() => {
        this.dismiss(id);
      }, duration);
      this.timers.set(id, timer);
    }

    return id;
  }

  success(message: string, options?: ToastOptions): string {
    return this.show('success', message, options);
  }

  error(message: string, options?: ToastOptions): string {
    return this.show('error', message, options);
  }

  warning(message: string, options?: ToastOptions): string {
    return this.show('warning', message, options);
  }

  info(message: string, options?: ToastOptions): string {
    return this.show('info', message, options);
  }

  /**
   * Dismiss a toast notification by ID
   */
  dismiss(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this.toastsState.update((current) => current.filter((t) => t.id !== id));
  }

  /**
   * Clear all active toasts
   */
  clear(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.toastsState.set([]);
  }
}
